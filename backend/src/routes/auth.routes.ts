import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, regNo } = req.body;

    if (!email || !regNo) {
      return res.status(400).json({
        success: false,
        message: "Email and Reg No required"
      });
    }

    const student = await prisma.students.findFirst({
      where: {
        email,
        reg_no: regNo
      }
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        email: student.email,
        regNo: student.reg_no
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      token,
      student
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;