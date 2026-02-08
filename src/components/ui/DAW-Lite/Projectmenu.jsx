import React, { useState } from "react";
import { useStore } from "../../../store/useStore.js";
import { exportProjectAsAudio } from "../../../lib/audioExport.js";

export default function ProjectMenu({ isMobile }) {
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
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-2 md:px-4 py-1.5 md:py-2 flex-shrink-0">
            {/* Buttons */}
            <div className="flex gap-1.5 md:gap-2 flex-wrap">
                <button
                    onClick={handleNew}
                    className={`${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-blue-500/80 text-white rounded-md hover:bg-blue-500 transition-colors font-semibold shadow-lg`}
                >
                    📄 {isMobile ? '' : 'New'}
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-green-500/80 text-white rounded-md hover:bg-green-500 transition-colors font-semibold disabled:opacity-50 shadow-lg`}
                >
                    💾 {isLoading ? "..." : (isMobile ? '' : 'Save')}
                </button>
                <button
                    onClick={handleLoadClick}
                    className={`${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-purple-500/80 text-white rounded-md hover:bg-purple-500 transition-colors font-semibold shadow-lg`}
                >
                    📂 {isMobile ? '' : 'Load'}
                </button>
                <button
                    onClick={handleExport}
                    disabled={isExporting || placedLoops.length === 0}
                    className={`${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-orange-500/80 text-white rounded-md hover:bg-orange-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                    title={placedLoops.length === 0 ? "Add loops to export" : "Export project as MP3 audio file"}
                >
                    {isExporting ? "⏳" : "⬇️"} {isMobile ? '' : 'Export'}
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
                <div className={`mt-2 md:mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2 md:p-4 ${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
                    <h3 className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'} mb-2 md:mb-3 text-white`}>Your Projects</h3>

                    {isLoading ? (
                        <p className="text-white/60 text-sm">Loading...</p>
                    ) : userProjects.length === 0 ? (
                        <p className="text-white/60 text-sm">No saved projects yet.</p>
                    ) : (
                        <div className="space-y-1.5 md:space-y-2">
                            {userProjects.map((project) => (
                                <div
                                    key={project.project_id}
                                    className={`flex items-center justify-between p-2 md:p-3 rounded-md border-2 ${project.project_id === currentProjectId
                                        ? "border-blue-400/50 bg-blue-500/20"
                                        : "border-white/20 bg-white/5"
                                        }`}
                                >
                                    <div className="flex-1 min-w-0 mr-2">
                                        <h4 className={`font-semibold text-white truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>{project.name}</h4>
                                        <p className="text-[10px] md:text-xs text-white/60">
                                            {project.bpm}bpm • {new Date(project.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                                        {project.project_id !== currentProjectId && (
                                            <button
                                                onClick={() => handleLoadProject(project.project_id)}
                                                className={`${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-sm'} bg-blue-500 text-white rounded hover:bg-blue-600 shadow-lg`}
                                            >
                                                Load
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(project.project_id, project.name)}
                                            className={`${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-sm'} bg-red-500 text-white rounded hover:bg-red-600 shadow-lg`}
                                        >
                                            Del
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