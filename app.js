const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 5000;

// Absolute path to the JSON file used as our simple data store.
const DATA_FILE = path.join(__dirname, "courses.json");

// Allowed status values for a course.
const ALLOWED_STATUSES = ["Not Started", "In Progress", "Completed"];

// Middleware to parse JSON request bodies.
app.use(express.json());

/**
 * Ensures courses.json exists.
 * If it does not exist, create it with an empty array ([]).
 */
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // If file is missing, create it with an empty list.
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf-8");
      return;
    }
    // Re-throw unexpected file system errors.
    throw error;
  }
}

/**
 * Reads all courses from courses.json.
 * Returns an array of courses.
 */
async function readCourses() {
  await ensureDataFile();

  try {
    const rawData = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(rawData);

    // If file content is somehow not an array, fallback to empty array.
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.name === "SyntaxError") {
      throw new Error("Invalid JSON format in courses.json");
    }
    throw error;
  }
}

/**
 * Writes the full course list back to courses.json.
 */
async function writeCourses(courses) {
  await fs.writeFile(DATA_FILE, JSON.stringify(courses, null, 2), "utf-8");
}

/**
 * Validates YYYY-MM-DD format.
 * This only checks format shape, not full date correctness.
 */
function isValidDateFormat(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Validates course payload.
 * For create requests, all fields are required.
 * For update requests, partial fields are allowed but validated if present.
 */
function validateCoursePayload(payload, { isCreate }) {
  const { name, description, target_date: targetDate, status } = payload;

  if (isCreate) {
    if (!name || !description || !targetDate || !status) {
      return "Missing required fields: name, description, target_date, and status are required.";
    }
  }

  if (name !== undefined && typeof name !== "string") {
    return "Invalid field: name must be a string.";
  }

  if (description !== undefined && typeof description !== "string") {
    return "Invalid field: description must be a string.";
  }

  if (targetDate !== undefined) {
    if (typeof targetDate !== "string" || !isValidDateFormat(targetDate)) {
      return "Invalid target_date: must be in YYYY-MM-DD format.";
    }
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return `Invalid status value. Allowed values: ${ALLOWED_STATUSES.join(", ")}.`;
  }

  return null;
}

/**
 * POST /api/courses
 * Adds a new course.
 */
app.post("/api/courses", async (req, res) => {
  try {
    const validationError = validateCoursePayload(req.body, { isCreate: true });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const courses = await readCourses();

    // Auto-generate numeric ID starting from 1.
    const nextId =
      courses.length > 0 ? Math.max(...courses.map((course) => course.id)) + 1 : 1;

    const newCourse = {
      id: nextId,
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status,
      // Timestamp generated automatically when the course is created.
      created_at: new Date().toISOString(),
    };

    courses.push(newCourse);
    await writeCourses(courses);

    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create course due to a file/server error.",
      details: error.message,
    });
  }
});

/**
 * GET /api/courses
 * Returns all courses.
 */
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await readCourses();
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to read courses due to a file/server error.",
      details: error.message,
    });
  }
});

/**
 * GET /api/courses/:id
 * Returns one course by ID.
 */
app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const courses = await readCourses();
    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    return res.json(course);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve course due to a file/server error.",
      details: error.message,
    });
  }
});

/**
 * PUT /api/courses/:id
 * Fully updates a course by ID.
 */
app.put("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const validationError = validateCoursePayload(req.body, { isCreate: true });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const courses = await readCourses();
    const courseIndex = courses.findIndex((item) => item.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Keep immutable fields (id and created_at), replace editable fields.
    const updatedCourse = {
      id: courses[courseIndex].id,
      created_at: courses[courseIndex].created_at,
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status,
    };

    courses[courseIndex] = updatedCourse;
    await writeCourses(courses);

    return res.json(updatedCourse);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update course due to a file/server error.",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/courses/:id
 * Deletes a course by ID.
 */
app.delete("/api/courses/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const courses = await readCourses();
    const courseIndex = courses.findIndex((item) => item.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    const [deletedCourse] = courses.splice(courseIndex, 1);
    await writeCourses(courses);

    return res.json({
      message: "Course deleted successfully.",
      course: deletedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete course due to a file/server error.",
      details: error.message,
    });
  }
});

/**
 * Health endpoint (optional but useful during development).
 */
app.get("/", (req, res) => {
  res.send("CodeCraftHub API is running.");
});

// Initialize file and then start server.
ensureDataFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize data file:", error.message);
    process.exit(1);
  });

