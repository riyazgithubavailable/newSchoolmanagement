
"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Download,
  X,
  Search,
  BookMarked,
  Users,
} from "lucide-react";

import Swal from "sweetalert2";
import { AppLayouts } from "@/layout/AppLayouts";
import AdvancedTable, { ColumnType } from "@/utils/AdvancedTable";

type MaterialType = "PDF" | "DOC" | "PPT" | "IMAGE";

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  className: string;
  section: string;
  subject: string;
  fileName: string;
  fileType: MaterialType;
  fileSize: string;
  uploadedDate: string;
  status: "Shared" | "Draft";
  file?: File;
}

const initialMaterials: StudyMaterial[] = [
  {
    id: "MAT-001",
    title: "Algebra Chapter Notes",
    description: "Important formulas and solved examples for Algebra.",
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    fileName: "algebra-notes.pdf",
    fileType: "PDF",
    fileSize: "2.4 MB",
    uploadedDate: "2026-11-10",
    status: "Shared",
  },
  {
    id: "MAT-002",
    title: "English Grammar Worksheet",
    description: "Practice worksheet covering grammar topics.",
    className: "Class 9",
    section: "B",
    subject: "English",
    fileName: "grammar-worksheet.docx",
    fileType: "DOC",
    fileSize: "850 KB",
    uploadedDate: "2026-11-09",
    status: "Shared",
  },
  {
    id: "MAT-003",
    title: "Science - Human Body",
    description: "Presentation about the human body and its systems.",
    className: "Class 10",
    section: "A",
    subject: "Science",
    fileName: "human-body.pptx",
    fileType: "PPT",
    fileSize: "4.1 MB",
    uploadedDate: "2026-11-08",
    status: "Shared",
  },
  {
    id: "MAT-004",
    title: "Geometry Diagrams",
    description: "Reference diagrams for geometry chapters.",
    className: "Class 9",
    section: "B",
    subject: "Mathematics",
    fileName: "geometry-diagrams.jpg",
    fileType: "IMAGE",
    fileSize: "1.2 MB",
    uploadedDate: "2026-11-07",
    status: "Draft",
  },
  {
    id: "MAT-005",
    title: "Physics Notes",
    description: "Notes about motion, force and energy.",
    className: "Class 10",
    section: "A",
    subject: "Science",
    fileName: "physics-notes.pdf",
    fileType: "PDF",
    fileSize: "3.5 MB",
    uploadedDate: "2026-11-05",
    status: "Shared",
  },
];

const emptyForm = {
  title: "",
  description: "",
  className: "",
  section: "",
  subject: "",
  status: "Shared" as "Shared" | "Draft",
};

const acceptedExtensions = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getFileType = (fileName: string): MaterialType => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "PDF";

  if (
    extension === "doc" ||
    extension === "docx"
  ) {
    return "DOC";
  }

  if (
    extension === "ppt" ||
    extension === "pptx"
  ) {
    return "PPT";
  }

  return "IMAGE";
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: MaterialType) => {
  switch (type) {
    case "PDF":
      return <FileText size={18} className="text-red-500" />;

    case "DOC":
      return (
        <FileSpreadsheet
          size={18}
          className="text-blue-500"
        />
      );

    case "PPT":
      return (
        <FileSpreadsheet
          size={18}
          className="text-orange-500"
        />
      );

    case "IMAGE":
      return (
        <FileImage
          size={18}
          className="text-purple-500"
        />
      );

    default:
      return <FileText size={18} />;
  }
};

export default function TeacherStudyMaterials() {
  const [materials, setMaterials] =
    useState<StudyMaterial[]>(initialMaterials);

  const [searchClass, setSearchClass] = useState("All");
  const [searchSection, setSearchSection] = useState("All");
  const [searchSubject, setSearchSubject] = useState("All");
  const [searchType, setSearchType] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<StudyMaterial | null>(null);

  const [viewMaterial, setViewMaterial] =
    useState<StudyMaterial | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [fileError, setFileError] = useState("");

  // Summary cards
  const totalMaterials = materials.length;

  const pdfCount = materials.filter(
    (item) => item.fileType === "PDF"
  ).length;

  const documentCount = materials.filter(
    (item) =>
      item.fileType === "DOC" ||
      item.fileType === "PPT"
  ).length;

  const sharedClasses = new Set(
    materials.map(
      (item) => `${item.className}-${item.section}`
    )
  ).size;

  // Dropdown options
  const classOptions = [
    "All",
    ...Array.from(
      new Set(materials.map((item) => item.className))
    ),
  ];

  const sectionOptions = [
    "All",
    ...Array.from(
      new Set(materials.map((item) => item.section))
    ),
  ];

  const subjectOptions = [
    "All",
    ...Array.from(
      new Set(materials.map((item) => item.subject))
    ),
  ];

  // Filter data
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const classMatch =
        searchClass === "All" ||
        item.className === searchClass;

      const sectionMatch =
        searchSection === "All" ||
        item.section === searchSection;

      const subjectMatch =
        searchSubject === "All" ||
        item.subject === searchSubject;

      const typeMatch =
        searchType === "All" ||
        item.fileType === searchType;

      return (
        classMatch &&
        sectionMatch &&
        subjectMatch &&
        typeMatch
      );
    });
  }, [
    materials,
    searchClass,
    searchSection,
    searchSubject,
    searchType,
  ]);

  const openAddModal = () => {
    setEditingMaterial(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setFileError("");
    setIsModalOpen(true);
  };

  const openEditModal = (material: StudyMaterial) => {
    setEditingMaterial(material);

    setForm({
      title: material.title,
      description: material.description,
      className: material.className,
      section: material.section,
      subject: material.subject,
      status: material.status,
    });

    setSelectedFile(material.file ?? null);
    setFileError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setFileError("");
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (
      !extension ||
      !acceptedExtensions.includes(extension)
    ) {
      setFileError(
        "Only PDF, DOC, DOCX, PPT, PPTX, JPG and PNG files are allowed."
      );

      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must not exceed 10 MB.");

      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      await Swal.fire({
        title: "Required Field",
        text: "Please enter material title.",
        icon: "warning",
      });
      return;
    }

    if (!form.className || !form.section || !form.subject) {
      await Swal.fire({
        title: "Missing Information",
        text: "Please select class, section and subject.",
        icon: "warning",
      });
      return;
    }

    if (!editingMaterial && !selectedFile) {
      await Swal.fire({
        title: "File Required",
        text: "Please select a file to upload.",
        icon: "warning",
      });
      return;
    }

    if (fileError) return;

    if (editingMaterial) {
      setMaterials((prev) =>
        prev.map((item) =>
          item.id === editingMaterial.id
            ? {
                ...item,
                ...form,
                fileName: selectedFile
                  ? selectedFile.name
                  : item.fileName,
                fileType: selectedFile
                  ? getFileType(selectedFile.name)
                  : item.fileType,
                fileSize: selectedFile
                  ? formatFileSize(selectedFile.size)
                  : item.fileSize,
                file: selectedFile ?? item.file,
              }
            : item
        )
      );

      closeModal();

      await Swal.fire({
        title: "Updated!",
        text: "Study material updated successfully.",
        icon: "success",
        confirmButtonColor: "#0F1B33",
      });
    } else {
      const newMaterial: StudyMaterial = {
        id: `MAT-${Date.now()}`,
        ...form,
        fileName: selectedFile!.name,
        fileType: getFileType(selectedFile!.name),
        fileSize: formatFileSize(selectedFile!.size),
        uploadedDate: new Date().toISOString().split("T")[0],
        file: selectedFile!,
      };

      setMaterials((prev) => [
        newMaterial,
        ...prev,
      ]);

      closeModal();

      await Swal.fire({
        title: "Uploaded!",
        text: "Study material added successfully.",
        icon: "success",
        confirmButtonColor: "#0F1B33",
      });
    }
  };

  const handleDelete = async (material: StudyMaterial) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${material.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setMaterials((prev) =>
        prev.filter((item) => item.id !== material.id)
      );

      await Swal.fire({
        title: "Deleted!",
        text: "Study material deleted successfully.",
        icon: "success",
        confirmButtonColor: "#0F1B33",
      });
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    if (!material.file) {
      await Swal.fire({
        title: "File Not Available",
        text: "This is sample data. No actual file is attached.",
        icon: "info",
        confirmButtonColor: "#0F1B33",
      });
      return;
    }

    const url = URL.createObjectURL(material.file);
    const link = document.createElement("a");

    link.href = url;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const columns: ColumnType<StudyMaterial>[] = [
    {
      key: "title",
      header: "Material",
      defaultVisible: true,
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3ED] flex items-center justify-center shrink-0">
            {getFileIcon(row.fileType)}
          </div>

          <div>
            <p className="font-semibold text-[#0F1B33]">
              {row.title}
            </p>
            <p className="text-xs text-gray-500">
              {row.fileName}
            </p>
          </div>
        </div>
      ),
      sortValue: (row) => row.title,
      exportValue: (row) => row.title,
    },
    {
      key: "className",
      header: "Class / Section",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.className} - {row.section}
        </span>
      ),
      sortValue: (row) => row.className,
      exportValue: (row) =>
        `${row.className} - ${row.section}`,
    },
    {
      key: "subject",
      header: "Subject",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm text-gray-700">
          {row.subject}
        </span>
      ),
      sortValue: (row) => row.subject,
    },
    {
      key: "fileType",
      header: "File Type",
      defaultVisible: true,
      cell: (row) => (
        <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          {row.fileType}
        </span>
      ),
      sortValue: (row) => row.fileType,
    },
    {
      key: "fileSize",
      header: "File Size",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {row.fileSize}
        </span>
      ),
    },
    {
      key: "uploadedDate",
      header: "Uploaded On",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(
            `${row.uploadedDate}T00:00:00`
          ).toLocaleDateString("en-IN")}
        </span>
      ),
      sortValue: (row) => row.uploadedDate,
    },
    {
      key: "status",
      header: "Status",
      defaultVisible: true,
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === "Shared"
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {row.status}
        </span>
      ),
      sortValue: (row) => row.status,
    },
    {
      key: "actions",
      header: "Actions",
      defaultVisible: true,
      exportable: false,
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View"
            onClick={() => setViewMaterial(row)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            title="Download"
            onClick={() => handleDownload(row)}
            className="rounded-lg p-2 text-green-600 hover:bg-green-50"
          >
            <Download size={17} />
          </button>

          <button
            type="button"
            title="Edit"
            onClick={() => openEditModal(row)}
            className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            title="Delete"
            onClick={() => handleDelete(row)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayouts>
      <div className="min-h-screen bg-[#FBF9F3] p-4 md:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-[#0F1B33]" size={25} />
              <h1 className="text-2xl font-bold text-[#0F1B33]">
                Study Materials
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Upload and manage learning materials for your students.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F1B33] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c3154]"
          >
            <Plus size={18} />
            Upload Material
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Materials"
            value={totalMaterials}
            icon={<BookOpen size={21} />}
            color="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="PDF Files"
            value={pdfCount}
            icon={<FileText size={21} />}
            color="bg-red-50 text-red-600"
          />

          <SummaryCard
            title="Documents & PPT"
            value={documentCount}
            icon={<FileSpreadsheet size={21} />}
            color="bg-orange-50 text-orange-600"
          />

          <SummaryCard
            title="Shared Classes"
            value={sharedClasses}
            icon={<Users size={21} />}
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-[#E8E4D9] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Search size={17} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-[#0F1B33]">
              Filter Materials
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Class"
              value={searchClass}
              onChange={setSearchClass}
              options={classOptions}
            />

            <FilterSelect
              label="Section"
              value={searchSection}
              onChange={setSearchSection}
              options={sectionOptions}
            />

            <FilterSelect
              label="Subject"
              value={searchSubject}
              onChange={setSearchSubject}
              options={subjectOptions}
            />

            <FilterSelect
              label="File Type"
              value={searchType}
              onChange={setSearchType}
              options={["All", "PDF", "DOC", "PPT", "IMAGE"]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#E8E4D9] bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0F1B33]">
              Material Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage all your uploaded learning materials.
            </p>
          </div>

          <AdvancedTable
            data={filteredMaterials}
            columns={columns}
            rowKey={(row) => row.id}
            searchKeys={[
              "title",
              "fileName",
              "className",
              "section",
              "subject",
              "fileType",
            ]}
            searchPlaceholder="Search materials..."
            initialPageSize={10}
            pageSizeOptions={[10, 50, 100, 150]}
            enableSearch
            enablePagination
            enableColumnToggle
            enableColumnResize
            stickyHeader
            enableExport
            enablePDFExport
            exportFileName="teacher-study-materials"
            exportSheetName="Study Materials"
            emptyText="No study materials found."
          />
        </div>

        {/* Add / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0F1B33]">
                    {editingMaterial
                      ? "Edit Study Material"
                      : "Upload Study Material"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Add learning material for your students.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Material Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter material title"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0F1B33]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter material description"
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0F1B33]"
                    />
                  </div>

                  <FormSelect
                    label="Class *"
                    value={form.className}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        className: value,
                      })
                    }
                    options={[
                      "Class 6",
                      "Class 7",
                      "Class 8",
                      "Class 9",
                      "Class 10",
                      "Class 11",
                      "Class 12",
                    ]}
                  />

                  <FormSelect
                    label="Section *"
                    value={form.section}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        section: value,
                      })
                    }
                    options={["A", "B", "C", "D"]}
                  />

                  <FormSelect
                    label="Subject *"
                    value={form.subject}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        subject: value,
                      })
                    }
                    options={[
                      "Mathematics",
                      "Science",
                      "English",
                      "Hindi",
                      "Social Science",
                      "Computer",
                    ]}
                  />

                  <FormSelect
                    label="Material Status"
                    value={form.status}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        status: value as "Shared" | "Draft",
                      })
                    }
                    options={["Shared", "Draft"]}
                  />

                  {/* File Upload */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Upload File{" "}
                      {!editingMaterial && "*"}
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-center transition hover:border-[#0F1B33] hover:bg-gray-100">
                      <Upload
                        size={26}
                        className="mb-2 text-[#0F1B33]"
                      />

                      <span className="text-sm font-semibold text-[#0F1B33]">
                        Click to select a file
                      </span>

                      <span className="mt-1 text-xs text-gray-500">
                        PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (Max 10 MB)
                      </span>

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {selectedFile && (
                      <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {getFileIcon(
                            getFileType(selectedFile.name)
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-700">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <X size={17} />
                        </button>
                      </div>
                    )}

                    {editingMaterial &&
                      !selectedFile &&
                      !editingMaterial.file && (
                        <p className="mt-2 text-xs text-gray-500">
                          Existing sample file: {editingMaterial.fileName}
                        </p>
                      )}

                    {fileError && (
                      <p className="mt-2 text-sm text-red-600">
                        {fileError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#0F1B33] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
                  >
                    {editingMaterial
                      ? "Update Material"
                      : "Upload Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {viewMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-[#0F1B33]">
                  Material Details
                </h2>

                <button
                  type="button"
                  onClick={() => setViewMaterial(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3 rounded-xl bg-[#F5F3ED] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                    {getFileIcon(viewMaterial.fileType)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#0F1B33]">
                      {viewMaterial.title}
                    </h3>
                    <p className="truncate text-xs text-gray-500">
                      {viewMaterial.fileName}
                    </p>
                  </div>
                </div>

                <DetailRow
                  label="Description"
                  value={viewMaterial.description || "No description"}
                />

                <DetailRow
                  label="Class"
                  value={`${viewMaterial.className} - ${viewMaterial.section}`}
                />

                <DetailRow
                  label="Subject"
                  value={viewMaterial.subject}
                />

                <DetailRow
                  label="File Type"
                  value={viewMaterial.fileType}
                />

                <DetailRow
                  label="File Size"
                  value={viewMaterial.fileSize}
                />

                <DetailRow
                  label="Uploaded On"
                  value={new Date(
                    `${viewMaterial.uploadedDate}T00:00:00`
                  ).toLocaleDateString("en-IN")}
                />

                <DetailRow
                  label="Status"
                  value={viewMaterial.status}
                />

                <button
                  type="button"
                  onClick={() => handleDownload(viewMaterial)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F1B33] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1c3154]"
                >
                  <Download size={17} />
                  Download Material
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayouts>
  );
}

// Reusable Summary Card
function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4D9] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-[#0F1B33]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Reusable Filter Select
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0F1B33]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label}s` : option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Reusable Form Select
function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0F1B33]"
      >
        <option value="">Select {label.replace(" *", "")}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// Reusable Details Row
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}
