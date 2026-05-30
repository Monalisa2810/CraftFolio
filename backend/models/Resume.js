import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  personalInfo: {
    name: String, email: String, phone: String, linkedin: String, github: String, location: String
  },
  summary: String,
  objective: String,
  skills: [String],
  experience: Array,
  projects: Array,
  education: Array,
  certifications: Array
}, { timestamps: true });

export default mongoose.model("Resume", resumeSchema);