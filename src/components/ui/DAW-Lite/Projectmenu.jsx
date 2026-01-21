import React, { useState } from "react";
import { useStore } from "../../../store/useStore.js";
import { exportProjectAsAudio } from "../../../lib/audioExport.js";

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
    const currentProjectId = useStore((state) => state.project.project_id);
    const placedLoops = useStore((state) => state.project.placedLoops);
    const bpm = useStore((state) => state.transport.bpm);
    const bars = useStore((state) => state.project.bars);
    const projectName = useStore((state) => state.project.name);
    const [isExporting, setIsExporting] = useState(false);

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

    const handleExport = async () => {
        if (placedLoops.length === 0) {
            showNotification("No loops to export. Add some loops to your project first.", "error");
            return;
        }

        setIsExporting(true);
        try {
            const filename = projectName || 'untitled-project';
            await exportProjectAsAudio(placedLoops, bpm, bars, filename);
            showNotification("Project exported successfully! Check your downloads folder.", "success");
        } catch (error) {
            console.error('Export error:', error);
            showNotification(`Export failed: ${error.message}`, "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 flex-shrink-0">
            {/* Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleNew}
                    className="px-3 py-1.5 bg-blue-500/80 text-white rounded-md hover:bg-blue-500 transition-colors font-semibold text-xs shadow-lg"
                >
                    📄 New
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-green-500/80 text-white rounded-md hover:bg-green-500 transition-colors font-semibold text-xs disabled:opacity-50 shadow-lg"
                >
                    💾 {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={handleLoadClick}
                    className="px-3 py-1.5 bg-purple-500/80 text-white rounded-md hover:bg-purple-500 transition-colors font-semibold text-xs shadow-lg"
                >
                    📂 Load
                </button>
                <button
                    onClick={handleExport}
                    disabled={isExporting || placedLoops.length === 0}
                    className="px-3 py-1.5 bg-orange-500/80 text-white rounded-md hover:bg-orange-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    title={placedLoops.length === 0 ? "Add loops to export" : "Export project as MP3 audio file"}
                >
                    {isExporting ? "⏳ Exp..." : "⬇️ Export"}
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`mt-2 p-2 rounded-md text-xs font-semibold backdrop-blur-sm ${notification.type === "success"
                        ? "bg-green-500/20 text-green-300 border border-green-400/30"
                        : "bg-red-500/20 text-red-300 border border-red-400/30"
                        }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Projects List */}
            {showProjects && (
                <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-3 text-white">Your Projects</h3>

                    {isLoading ? (
                        <p className="text-white/60">Loading...</p>
                    ) : userProjects.length === 0 ? (
                        <p className="text-white/60">No saved projects yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {userProjects.map((project) => (
                                <div
                                    key={project.project_id}
                                    className={`flex items-center justify-between p-3 rounded-md border-2 ${project.prokect_id === currentProjectId
                                        ? "border-blue-400/50 bg-blue-500/20"
                                        : "border-white/20 bg-white/5"
                                        }`}
                                >
                                    <div>
                                        <h4 className="font-semibold text-white">{project.name}</h4>
                                        <p className="text-xs text-white/60">
                                            BPM: {project.bpm} • {new Date(project.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {project.project_id !== currentProjectId && (
                                            <button
                                                onClick={() => handleLoadProject(project.project_id)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 shadow-lg"
                                            >
                                                Load
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(project.project_id, project.name)}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 shadow-lg"
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