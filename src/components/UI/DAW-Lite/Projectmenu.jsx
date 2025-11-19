import React, { useState } from "react";
import { useStore } from "../../../store/useStore.js";

export default function ProjectMenu() {
    const [showProjects, setShowProjects] = useState(false);
    const [notification, setNotification] = useState(null);

    const saveProject = useStore((state) => state.saveProject);
    const loadProject = useStore((state) => state.loadProject);
    const newProject = useStore((state) => state.newProject);
    const loadUserProjects = useStore((state) => state.loadUserProjects);
    const deleteProject = useStore((state) => state.deleteProject);
    const userProjects = useStore((state) => state.userProjects);
    const isLoading = useStore((state) => state.isLoading);
    const currentProjectId = useStore((state) => state.project.id);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = async () => {
        const result = await saveProject();
        showNotification(result.message, result.success ? "success" : "error");
    };

    const handleNew = () => {
        if (confirm("Create new project? Unsaved changes will be lost.")) {
            newProject();
            showNotification("New project created!", "success");
        }
    };

    const handleLoadClick = async () => {
        setShowProjects(!showProjects);
        if (!showProjects) {
            await loadUserProjects();
        }
    };

    const handleLoadProject = async (projectId) => {
        const result = await loadProject(projectId);
        showNotification(
            result.success ? "Project loaded!" : "Failed to load",
            result.success ? "success" : "error"
        );
        if (result.success) {
            setShowProjects(false);
        }
    };

    const handleDelete = async (projectId, projectName) => {
        if (confirm(`Delete "${projectName}"? This cannot be undone.`)) {
            const result = await deleteProject(projectId);
            showNotification(
                result.success ? "Project deleted!" : "Failed to delete",
                result.success ? "success" : "error"
            );
        }
    };

    return (
        <div className="border-b border-gray-300 bg-gray-50 px-6 py-3">
            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleNew}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-semibold text-sm"
                >
                    📄 New
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-semibold text-sm disabled:opacity-50"
                >
                    💾 {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={handleLoadClick}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-semibold text-sm"
                >
                    📂 Load Projects
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`mt-3 p-3 rounded-md text-sm font-semibold ${notification.type === "success"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Projects List */}
            {showProjects && (
                <div className="mt-4 bg-white border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Your Projects</h3>

                    {isLoading ? (
                        <p className="text-gray-600">Loading...</p>
                    ) : userProjects.length === 0 ? (
                        <p className="text-gray-600">No saved projects yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {userProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className={`flex items-center justify-between p-3 rounded-md border-2 ${project.id === currentProjectId
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{project.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            BPM: {project.bpm} • {new Date(project.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {project.id !== currentProjectId && (
                                            <button
                                                onClick={() => handleLoadProject(project.id)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                            >
                                                Load
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(project.id, project.name)}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}