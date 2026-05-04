import Job from "../Models/job.js";

export const addJob = async (req, res) => {
  try {
    const { company, position, jobDescription, status, notes } = req.body;

    if (!company || !position) {
      return res.status(400).json({ message: "Company and position are required" });
    }

    const job = await Job.create({
      userId: req.user.id,
      company: company.trim(),
      position: position.trim(),
      jobDescription: jobDescription || '',
      status: status || 'Applied',
      notes: notes || ''
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Add Job Error:", error);
    res.status(500).json({ message: "Failed to add job" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

export const updateJob = async (req, res) => {
  try {
    // ✅ FIX: Sirf apni job update kar sake (userId check)
    const updated = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Job Error:", error);
    res.status(500).json({ message: "Failed to update job" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    // ✅ FIX: Sirf apni job delete kar sake (userId check)
    const deleted = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
};
