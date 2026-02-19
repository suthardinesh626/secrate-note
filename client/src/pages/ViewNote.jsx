import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function ViewNote() {
    const { id } = useParams();

    // Unlock state
    const [password, setPassword] = useState("");
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [unlockError, setUnlockError] = useState("");

    // Note state
    const [noteData, setNoteData] = useState(null);

    // Summary state
    const [summary, setSummary] = useState("");
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState("");

    const handleUnlock = async (e) => {
        e.preventDefault();
        setUnlockError("");

        if (!password.trim()) {
            setUnlockError("Password is required.");
            return;
        }

        setUnlockLoading(true);
        try {
            const res = await fetch(`/api/notes/${id}/unlock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to unlock note");
            }

            setNoteData(data.data);
        } catch (err) {
            setUnlockError(err.message);
        } finally {
            setUnlockLoading(false);
        }
    };

    const handleSummarize = async () => {
        setSummaryError("");
        setSummary("");
        setSummaryLoading(true);

        try {
            const res = await fetch(`/api/notes/${id}/summarize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to summarize note");
            }

            setSummary(data.data.summary);
        } catch (err) {
            setSummaryError(err.message);
        } finally {
            setSummaryLoading(false);
        }
    };

    // Locked state — show password input
    if (!noteData) {
        return (
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>🔒 Unlock Note</CardTitle>
                        <CardDescription>
                            Enter the password to view this note.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter note password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={unlockLoading}
                                />
                            </div>

                            {unlockError && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{unlockError}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" disabled={unlockLoading} className="w-full">
                                {unlockLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Unlocking...
                                    </span>
                                ) : (
                                    "Unlock Note"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Unlocked state — show note + summarize button
    return (
        <div className="max-w-xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Note</CardTitle>
                    <CardDescription>
                        Created on{" "}
                        {new Date(noteData.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                        {noteData.noteText}
                    </div>
                </CardContent>
            </Card>

            {/* AI Summary Section */}
            <Card className="py-4" >
                <CardContent className="space-y-4">
                    <Button
                        onClick={handleSummarize}
                        disabled={summaryLoading}
                        variant="outline"
                        className="w-full"
                    >
                        {summaryLoading ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Summarizing...
                            </span>
                        ) : (
                            "Summarize this note"
                        )}
                    </Button>

                    {summaryError && (
                        <Alert variant="destructive">
                            <AlertTitle>Summarization Failed</AlertTitle>
                            <AlertDescription>{summaryError}</AlertDescription>
                        </Alert>
                    )}

                    {summary && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                                {summary}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
