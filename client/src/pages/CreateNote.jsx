import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const MAX_CHARS = 500;

export default function CreateNote() {
    const [noteText, setNoteText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState({ url: false, password: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);

        if (!noteText.trim()) {
            setError("Note text cannot be empty.");
            return;
        }

        if (noteText.length > MAX_CHARS) {
            setError(`Note must be ${MAX_CHARS} characters or less.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteText: noteText.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create note");
            }

            setResult(data.data);
            setNoteText("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied((prev) => ({ ...prev, [field]: true }));
            setTimeout(() => setCopied((prev) => ({ ...prev, [field]: false })), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied((prev) => ({ ...prev, [field]: true }));
            setTimeout(() => setCopied((prev) => ({ ...prev, [field]: false })), 2000);
        }
    };

    const fullUrl = result
        ? `${window.location.origin}/note/${result.noteId}`
        : "";

    return (
        <div className="max-w-xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create a Secure Note</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="noteText">Note</Label>
                            <Textarea
                                id="noteText"
                                placeholder="Type your note here..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                maxLength={MAX_CHARS}
                                rows={6}
                                disabled={loading}
                                className="resize-none"
                            />
                            <p className="text-sm text-muted-foreground text-right">
                                {noteText.length}/{MAX_CHARS}
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
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
                                    Creating...
                                </span>
                            ) : (
                                "Create Secure Note"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {result && (
                <Card className="mt-6 border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-green-800">
                            ✅ Note Created Successfully
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            Save these details — the password will not be shown again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-green-800 font-medium">
                                Shareable URL
                            </Label>
                            <div className="flex gap-2">
                                <code className="flex-1 bg-white border rounded px-3 py-2 text-sm break-all">
                                    {fullUrl}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(fullUrl, "url")}
                                    className="shrink-0"
                                >
                                    {copied.url ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-green-800 font-medium">Password</Label>
                            <div className="flex gap-2">
                                <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono">
                                    {result.password}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(result.password, "password")}
                                    className="shrink-0"
                                >
                                    {copied.password ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
