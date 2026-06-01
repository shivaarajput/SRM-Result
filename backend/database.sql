-- Database Setup Script for SRM Results Portal

-- Create database (run this separately if needed)
-- CREATE DATABASE srm_results;

-- Create table for MCA cohort results
CREATE TABLE IF NOT EXISTS mca_cohort_results (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  registration_number VARCHAR(20) NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  grade VARCHAR(2) NOT NULL CHECK (grade IN ('O', 'A+', 'A', 'B+', 'B', 'C', 'F')),
  semester INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(registration_number, subject_code, semester)
);

-- Create indexes for faster queries
CREATE INDEX idx_email ON mca_cohort_results(LOWER(email));
CREATE INDEX idx_registration_number ON mca_cohort_results(UPPER(registration_number));
CREATE INDEX idx_email_reg_combo ON mca_cohort_results(LOWER(email), UPPER(registration_number));

-- Sample data (optional - replace with actual student data)
-- INSERT INTO mca_cohort_results (student_name, email, registration_number, subject_code, grade, semester)
-- VALUES 
--   ('Aditya Govindarajan', 'aditya@example.com', 'RA25322410300001', 'CS101', 'O', 1),
--   ('Aditya Govindarajan', 'aditya@example.com', 'RA25322410300001', 'CS102', 'A+', 1),
--   ('Ashwani Kumar', 'ashwani@example.com', 'RA25322410300002', 'CS101', 'A', 1),
--   ('Ashwani Kumar', 'ashwani@example.com', 'RA25322410300002', 'CS102', 'B+', 1);
