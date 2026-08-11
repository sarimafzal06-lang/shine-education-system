const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DB_FILE = path.join(__dirname, "database.json");

// ===============================
// READ DATABASE
// ===============================

function readDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, "utf8");
        const database = JSON.parse(data);

        database.students = Array.isArray(database.students)
            ? database.students
            : [];

        database.teachers = Array.isArray(database.teachers)
            ? database.teachers
            : [];

        database.results = Array.isArray(database.results)
            ? database.results
            : [];

        database.attendance = Array.isArray(database.attendance)
            ? database.attendance
            : [];

        database.fees = Array.isArray(database.fees)
            ? database.fees
            : [];

        database.announcements = Array.isArray(database.announcements)
            ? database.announcements
            : [];

        return database;

    } catch (error) {
        return {
            students: [],
            teachers: [],
            results: [],
            attendance: [],
            fees: [],
            announcements: []
        };
    }
}

// ===============================
// SAVE DATABASE
// ===============================

function saveDatabase(database) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(database, null, 4),
        "utf8"
    );
}

// ===============================
// GET REQUEST BODY
// ===============================

function getRequestBody(req, callback) {
    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {
        try {
            const data = JSON.parse(body);
            callback(data);
        } catch (error) {
            callback(null);
        }
    });
}

// ===============================
// SERVER
// ===============================

const server = http.createServer((req, res) => {

    // ===============================
    // GET DATABASE
    // ===============================

    if (
        req.method === "GET" &&
        req.url === "/api/data"
    ) {
        const database = readDatabase();

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(database));
        return;
    }

    // ===============================
    // STUDENT PORTAL SEARCH
    // ===============================

    if (
        req.method === "GET" &&
        req.url.startsWith("/api/student/")
    ) {
        const rollNo = decodeURIComponent(
            req.url.substring("/api/student/".length)
        ).trim();

        const database = readDatabase();

        const student = database.students.find(item => {
            return String(item.rollNo).trim() === rollNo;
        });

        if (!student) {
            res.writeHead(404, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Student record not found."
            }));

            return;
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true,
            student: {
                rollNo: student.rollNo,
                studentName: student.studentName,
                fatherName: student.fatherName,
                className: student.className,
                phone: student.phone,
                notification: student.notification || null,
                status: student.status || null
            }
        }));

        return;
    }
// ===============================
// ADMISSION STATUS UPDATE
// ===============================

if (
    req.method === "PUT" &&
    req.url.startsWith("/api/admissions/")
) {

    const id =
        Number(req.url.split("/").pop());

    getRequestBody(req, data => {

        if (!data || !data.status) {

            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Status required."
            }));

            return;
        }

        const database = readDatabase();

        const admission =
            database.admissions.find(
                item => Number(item.id) === id
            );

        if (!admission) {

            res.writeHead(404, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Admission not found."
            }));

            return;
        }

        admission.status =
            data.status;

        admission.notification = {
            title:
                data.status === "Approved"
                    ? "Admission Approved"
                    : "Admission Rejected",

            message:
                data.status === "Approved"
                    ? "Your admission has been approved. Please visit The Shine Education System, Campus 2."
                    : "Your admission request has been rejected.",

            date:
                new Date().toISOString()
        };

        saveDatabase(database);

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true,
            admission: admission
        }));

    });

    return;
}
// ===============================
// ADMISSION STATUS UPDATE
// ===============================

if (
    req.method === "PUT" &&
    req.url.startsWith("/api/admissions/")
) {

    const id =
        Number(req.url.split("/").pop());

    getRequestBody(req, data => {

        if (!data || !data.status) {

            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Status required."
            }));

            return;
        }

        const database = readDatabase();

        const admission =
            database.admissions.find(
                item => Number(item.id) === id
            );

        if (!admission) {

            res.writeHead(404, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Admission not found."
            }));

            return;
        }

        admission.status =
            data.status;

        const notification = {

            title:
                data.status === "Approved"
                    ? "Admission Approved"
                    : "Admission Rejected",

            message:
                data.status === "Approved"
                    ? "Your admission has been approved. Please visit The Shine Education System, Campus 2."
                    : "Your admission request has been rejected.",

            date:
                new Date().toISOString()
        };

        admission.notification =
            notification;

        const student =
            database.students.find(
                item =>
                    String(item.phone).trim() ===
                    String(admission.phone).trim()
            );

        if (student) {

            student.notification =
                notification;

            student.status =
                data.status;
        }

        saveDatabase(database);

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true,
            admission: admission
        }));

    });

    return;
}
    // ===============================
    // ADD STUDENT
    // ===============================

    if (
        req.method === "POST" &&
        req.url === "/api/students"
    ) {
        getRequestBody(req, student => {

            if (!student) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false
                }));

                return;
            }

            const database = readDatabase();

            database.students.push(student);

            saveDatabase(database);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true
            }));
        });

        return;
    }

    // ===============================
    // DELETE STUDENT
    // ===============================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/students/")
    ) {
        const index = parseInt(
            req.url.split("/").pop()
        );

        const database = readDatabase();

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < database.students.length
        ) {
            database.students.splice(index, 1);
            saveDatabase(database);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true
        }));

        return;
    }

    // ===============================
    // ADD TEACHER
    // ===============================

    if (
        req.method === "POST" &&
        req.url === "/api/teachers"
    ) {
        getRequestBody(req, teacher => {

            if (!teacher) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false
                }));

                return;
            }

            const database = readDatabase();

            database.teachers.push(teacher);

            saveDatabase(database);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true
            }));
        });

        return;
    }

    // ===============================
    // DELETE TEACHER
    // ===============================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/teachers/")
    ) {
        const index = parseInt(
            req.url.split("/").pop()
        );

        const database = readDatabase();

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < database.teachers.length
        ) {
            database.teachers.splice(index, 1);
            saveDatabase(database);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true
        }));

        return;
    }

    // ===============================
    // ADD RESULT
    // ===============================

    if (
        req.method === "POST" &&
        req.url === "/api/results"
    ) {
        getRequestBody(req, result => {

            if (!result) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false
                }));

                return;
            }

            const database = readDatabase();

            database.results.push(result);

            saveDatabase(database);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true
            }));
        });

        return;
    }

    // ===============================
    // DELETE RESULT
    // ===============================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/results/")
    ) {
        const index = parseInt(
            req.url.split("/").pop()
        );

        const database = readDatabase();

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < database.results.length
        ) {
            database.results.splice(index, 1);
            saveDatabase(database);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true
        }));

        return;
    }

    // ===============================
    // ADD ATTENDANCE
    // ===============================

    if (
        req.method === "POST" &&
        req.url === "/api/attendance"
    ) {
        getRequestBody(req, attendance => {

            if (!attendance) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false
                }));

                return;
            }

            const database = readDatabase();

            database.attendance.push(attendance);

            saveDatabase(database);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true
            }));
        });

        return;
    }

    // ===============================
    // DELETE ATTENDANCE
    // ===============================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/attendance/")
    ) {
        const index = parseInt(
            req.url.split("/").pop()
        );

        const database = readDatabase();

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < database.attendance.length
        ) {
            database.attendance.splice(index, 1);
            saveDatabase(database);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true
        }));

        return;
    }

    // ===============================
    // ADD FEE
    // ===============================

    if (
        req.method === "POST" &&
        req.url === "/api/fees"
    ) {
        getRequestBody(req, fee => {

            if (!fee) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false
                }));

                return;
            }

            const database = readDatabase();

            database.fees.push(fee);

            saveDatabase(database);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true
            }));
        });

        return;
    }

    // ===============================
    // DELETE FEE
    // ===============================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/fees/")
    ) {
        const index = parseInt(
            req.url.split("/").pop()
        );

        const database = readDatabase();

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < database.fees.length
        ) {
            database.fees.splice(index, 1);
            saveDatabase(database);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true
        }));

        return;
    }

    // ===============================
    // ADD ANNOUNCEMENT
    // ===============================

    if (
        req.method === "POST" &&
        req.url === "/api/announcements"
    ) {
        getRequestBody(req, announcement => {

            if (!announcement) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false
                }));

                return;
            }

            const database = readDatabase();

            database.announcements.push(announcement);

            saveDatabase(database);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true
            }));
        });

        return;
    }

    // ===============================
    // DELETE ANNOUNCEMENT
    // ===============================

    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/announcements/")
    ) {
        const index = parseInt(
            req.url.split("/").pop()
        );

        const database = readDatabase();

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < database.announcements.length
        ) {
            database.announcements.splice(index, 1);
            saveDatabase(database);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: true
        }));

        return;
    }
      // ===============================
// ADD ADMISSION
// ===============================

if (
    req.method === "POST" &&
    req.url === "/api/admissions"
) {

    getRequestBody(req, admission => {

        if (!admission) {

            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Invalid admission data."
            }));

            return;
        }


        const database = readDatabase();


        if (!Array.isArray(database.admissions)) {
            database.admissions = [];
        }


        admission.id =
            Date.now();


        admission.status =
            "Pending";


        database.admissions.push(
            admission
        );


        saveDatabase(database);


        res.writeHead(200, {
            "Content-Type": "application/json"
        });


        res.end(JSON.stringify({
            success: true,
            message: "Admission submitted successfully."
        }));

    });

    return;
}
    // ===============================
    // STUDENT PORTAL PAGE
    // ===============================

    if (
        req.method === "GET" &&
        req.url.startsWith("/student-portal.html")
    ) {
        const portalPath = path.join(
            __dirname,
            "student-portal.html"
        );

        fs.readFile(
            portalPath,
            "utf8",
            (error, content) => {

                if (error) {
                    res.writeHead(500, {
                        "Content-Type": "text/plain"
                    });

                    res.end(
                        "Student Portal file could not be loaded."
                    );

                    return;
                }

                res.writeHead(200, {
                    "Content-Type":
                        "text/html; charset=utf-8"
                });

                res.end(content);
            }
        );

        return;
    }

    // ===============================
    // WEBSITE FILES
    // ===============================

    let filePath;

    if (req.url === "/") {
        filePath = path.join(
            __dirname,
            "index.html"
        );
    } else {
        filePath = path.join(
            __dirname,
            req.url.substring(1)
        );
    }

    fs.readFile(
        filePath,
        (error, content) => {

            if (error) {
                res.writeHead(404, {
                    "Content-Type":
                        "text/html; charset=utf-8"
                });

                res.end(
                    "<h1>404 - Page Not Found</h1>"
                );

                return;
            }

            let contentType =
                "text/html; charset=utf-8";

            if (filePath.endsWith(".css")) {
                contentType = "text/css";
            }

            if (filePath.endsWith(".js")) {
                contentType = "application/javascript";
            }

            res.writeHead(200, {
                "Content-Type": contentType
            });

            res.end(content);
        }
    );
});

// ===============================
// START SERVER
// ===============================

server.listen(
    PORT,
    () => {

        console.log(
            "The Shine Education System"
        );

        console.log(
            "Website: http://localhost:" + PORT
        );

        console.log(
            "Server is running..."
        );
    }
);