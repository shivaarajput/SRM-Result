import { Router } from "express";
import prisma from "../lib/prisma";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      cgpa,
      grades,
      elective,
      editCount
    } = req.body;

    const reg_no = req.user!.regNo;

    const result = await prisma.results.upsert({
      where: {
        reg_no
      },
      update: {
        cgpa,
        grades,
        elective,
        edit_count: editCount
      },
      create: {
        reg_no,
        name,
        cgpa,
        grades,
        elective,
        edit_count: editCount
      }
    });

    res.json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const result = await prisma.results.findUnique({
      where: {
        reg_no: req.user!.regNo
      }
    });

    res.json(result);

  } catch {
    res.status(500).json({
      success: false
    });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const results = await prisma.results.findMany({
      orderBy: {
        cgpa: "desc"
      }
    });

    res.json(results);

  } catch {
    res.status(500).json({
      success: false
    });
  }
});

router.patch(
  "/edit-count",
  auth,
  async (req, res) => {

    try {

      const result =
        await prisma.results.findUnique({
          where: {
            reg_no:
              req.user!.regNo
          }
        });

      if (!result) {

        return res.status(404).json({
          success: false
        });
      }

      if (
        result.edit_count! >= 1
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Edit limit reached"
        });
      }

      const updated =
        await prisma.results.update({
          where: {
            reg_no:
              req.user!.regNo
          },

          data: {
            edit_count: {
              increment: 1
            }
          }
        });

      res.json(updated);

    } catch {

      res.status(500).json({
        success: false
      });
    }
  }
);

export default router;