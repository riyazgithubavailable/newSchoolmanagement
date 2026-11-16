
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Paperclip,
  Upload,
  X,
  Save,
  Send,
} from "lucide-react";
import { AppLayouts } from "@/layout/AppLayouts";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

type AssignmentFormData = {
  title: string;
  className: string;
  section: string;
  subject: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: string;
};

const initialFormData: AssignmentFormData = {
  title: "",
  className: "",
  section: "",
  subject: "",
  description: "",
  assignedDate: getTodayDate(),
  dueDate: "",
  maxMarks: "100",
};

export default function CreateAssignment() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<AssignmentFormData>(initialFormData);

  const [attachment, setAttachment] = useState<File | null>(null);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAttachment = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("File size should not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (formData.dueDate < formData.assignedDate) {
      toast.error("Due date cannot be before the assigned date.");
      return;
    }

    const assignmentData = {
      ...formData,
      attachment,
    };

    console.log("Assignment Data:", assignmentData);

    toast.success("Assignment created successfully!");

    setFormData(initialFormData);
    setAttachment(null);
  };

  return (
    <AppLayouts>
      <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px]">

          {/* Page Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm text-[#8B867A]">
              <BookOpen className="h-4 w-4" />
              <span>Teacher Portal</span>
              <span>/</span>
              <button
                type="button"
                onClick={() => navigate("/teacher/assignments")}
                className="transition hover:text-[#0F1B33]"
              >
                Assignments
              </button>
              <span>/</span>
              <span className="text-[#5E6472]">
                Create Assignment
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
                  Create Assignment
                </h1>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Create and share a new assignment with your students.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/teacher/assignments")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCD6C9] bg-white px-4 py-2.5 text-sm font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Assignments
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information */}
            <section className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
              <div className="flex items-center gap-3 border-b border-[#E8E4D9] px-5 py-4 sm:px-6">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0F1B33]">
                    Basic Information
                  </h2>
                  <p className="mt-0.5 text-xs text-[#8B867A]">
                    Enter assignment details and select your class.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                {/* Assignment Title */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                    Assignment Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Algebra - Chapter 5 Exercises"
                    required
                    maxLength={120}
                    className="w-full rounded-lg border border-[#DCD6C9] px-3 py-3 text-sm text-[#0F1B33] outline-none transition placeholder:text-[#B0AAA0] focus:border-[#0F1B33] focus:ring-2 focus:ring-[#0F1B33]/5"
                  />
                </div>

                {/* Class */}
                <FormField label="Class" required>
                  <select
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Class</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </FormField>

                {/* Section */}
                <FormField label="Section" required>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </FormField>

                {/* Subject */}
                <FormField label="Subject" required>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </FormField>

                {/* Maximum Marks */}
                <FormField label="Maximum Marks" required>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleChange}
                    min="1"
                    max="1000"
                    required
                    className="form-input"
                    placeholder="Enter maximum marks"
                  />
                </FormField>
              </div>
            </section>

            {/* Instructions */}
            <section className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
              <div className="flex items-center gap-3 border-b border-[#E8E4D9] px-5 py-4 sm:px-6">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0F1B33]">
                    Assignment Instructions
                  </h2>
                  <p className="mt-0.5 text-xs text-[#8B867A]">
                    Explain the tasks students need to complete.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <label className="mb-2 block text-sm font-medium text-[#5E6472]">
                  Description / Instructions{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={2000}
                  placeholder="Write assignment instructions, topics to cover, submission guidelines, etc."
                  className="w-full resize-y rounded-lg border border-[#DCD6C9] px-3 py-3 text-sm text-[#0F1B33] outline-none transition placeholder:text-[#B0AAA0] focus:border-[#0F1B33] focus:ring-2 focus:ring-[#0F1B33]/5"
                />
                <p className="mt-2 text-right text-xs text-[#8B867A]">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </section>

            {/* Schedule */}
            <section className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
              <div className="flex items-center gap-3 border-b border-[#E8E4D9] px-5 py-4 sm:px-6">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0F1B33]">
                    Assignment Schedule
                  </h2>
                  <p className="mt-0.5 text-xs text-[#8B867A]">
                    Set when the assignment is given and when it is due.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <FormField label="Assigned Date" required>
                  <input
                    type="date"
                    name="assignedDate"
                    value={formData.assignedDate}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </FormField>

                <FormField label="Due Date" required>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    min={formData.assignedDate}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </FormField>
              </div>
            </section>

            {/* Attachment */}
            <section className="overflow-hidden rounded-xl border border-[#E8E4D9] bg-white">
              <div className="flex items-center gap-3 border-b border-[#E8E4D9] px-5 py-4 sm:px-6">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <Paperclip className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0F1B33]">
                    Attachments
                  </h2>
                  <p className="mt-0.5 text-xs text-[#8B867A]">
                    Upload supporting documents for students (optional).
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {!attachment ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DCD6C9] bg-[#FCFBF8] px-5 py-9 text-center transition hover:border-[#0F1B33] hover:bg-[#F8F6F0]">
                    <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                      <Upload className="h-6 w-6 text-[#0F1B33]" />
                    </div>
                    <p className="text-sm font-semibold text-[#0F1B33]">
                      Click to upload a file
                    </p>
                    <p className="mt-1 text-xs text-[#8B867A]">
                      PDF, DOC, DOCX, PPT, PPTX, JPG or PNG
                    </p>
                    <p className="mt-1 text-xs text-[#8B867A]">
                      Maximum file size: 10 MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                      onChange={handleAttachment}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E8E4D9] bg-[#FCFBF8] p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#0F1B33]">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-[#8B867A]">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      aria-label="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 rounded-xl border border-[#E8E4D9] bg-white p-5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/teacher/assignments")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCD6C9] bg-white px-5 py-2.5 text-sm font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F1B33] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D2B49]"
              >
                <Send className="h-4 w-4" />
                Create Assignment
              </button>
            </div>

          </form>
        </div>
      </div>
    </AppLayouts>
  );
}

// Reusable Form Field
type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#5E6472]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
