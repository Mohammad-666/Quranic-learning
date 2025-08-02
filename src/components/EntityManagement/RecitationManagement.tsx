import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Recitation } from "../../types";
import { apiService } from "../../services/api";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Modal } from "../UI/Modal";
import { Table } from "../UI/Table";
import { RecitationForm } from "../Forms/RecitationForm";

export const RecitationManagement: React.FC = () => {
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecitation, setEditingRecitation] = useState<Recitation | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
const fetchRecitations = async () => {
  setLoading(true);
  try {
    const response = await apiService.getAll("recitation");
    console.log("🔍 Recitations Response:", response);
    setRecitations(response.student_recitation || []);
  } catch (error) {
    console.error("Failed to fetch recitations:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchRecitations();
  }, []);

  const handleSave = async (recitationData: Recitation) => {
    try {
      setValidationErrors({});
      if (editingRecitation?.id) {
        await apiService.update(
          "recitation",
          editingRecitation.id,
          recitationData
        );
      } else {
        await apiService.create("recitation", recitationData);
      }
      await fetchRecitations();
      setIsModalOpen(false);
      setEditingRecitation(null);
    } catch (error: any) {
      console.error("Failed to save recitation:", error);
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (recitation: Recitation) => {
    if (
      window.confirm("Are you sure you want to delete this recitation record?")
    ) {
      try {
        await apiService.delete("recitation", recitation.id!);
        await fetchRecitations();
      } catch (error) {
        console.error("Failed to delete recitation:", error);
      }
    }
  };

  const filteredRecitations = recitations.filter(
    (record) =>
      record.student_id?.toString().includes(searchTerm) ||
      record.course_id?.toString().includes(searchTerm)
  );

  const columns = [
    { key: "student_id", label: "Student ID" },
    { key: "course_id", label: "Course ID" },
    { key: "lesson_id", label: "Lesson ID" },
    { key: "current_juz", label: "Current Juz" },
    { key: "current_juz_page", label: "Current Page" },
    {
      key: "recitation_evaluation",
      label: "Evaluation",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Excellent"
              ? "bg-green-100 text-green-800"
              : value === "Good"
              ? "bg-blue-100 text-blue-800"
              : value === "Fair"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Search recitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Recitation
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredRecitations}
        onEdit={(recitation) => {
          setEditingRecitation(recitation);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecitation(null);
        }}
        title={editingRecitation ? "Edit Recitation" : "Add New Recitation"}
        size="lg"
      >
        <RecitationForm
          initialData={editingRecitation}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingRecitation(null);
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};
