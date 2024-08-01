'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PutBlobResult } from '@vercel/blob';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface FileInfo extends PutBlobResult {
  pathname: string;
}

export default function FileManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileInfo | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const response = await fetch('/api/files');
    if (response.ok) {
      const data = await response.json();
      setFiles(data.blobs);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputFileRef.current?.files?.length) {
      toast({ title: "Error", description: "No file has been selected." });
      return;
    }

    const file = inputFileRef.current.files[0];

    if (file.size > 4.5 * 1024 * 1024) {
      toast({ title: "Error", description: "The file is too large. The limit is 5MB." });
      return;
    }

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Error in file upload');

      await fetchFiles();
      toast({ title: "Success", description: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Error in file upload" });
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Success",
        description: "File selected successfully"
      });
    }
  };

  const handleDelete = async (url: string) => {
    try {
      const response = await fetch(`/api/delete`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      await fetchFiles();
      toast({ title: "Success", description: "File deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Error deleting the file" });
      console.error('Delete failed:', error);
    }
  };

  const handleRename = (file: FileInfo) => {
    setFileToRename(file);
    setNewFileName(file.pathname);
    setIsRenaming(true);
  };

  const submitRename = async () => {
    if (!fileToRename) return;

    try {
      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldUrl: fileToRename.url,
          newFilename: newFileName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error renaming the file');
      }

      await fetchFiles();
      toast({ title: "Success", description: "File renamed successfully" });
    } catch (error) {
      toast({ title: "Error" || "Error renaming the file" });
      console.error('Rename failed:', error);
    } finally {
      setIsRenaming(false);
      setFileToRename(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">File Manager</h1>

      <form onSubmit={handleUpload} className="mb-6">
        <input
          type="file"
          ref={inputFileRef}
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <Button
          type="button"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="mr-2"
        >
          Select File
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload file'}
        </Button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Uploaded files</h2>
        {files.map(file => (
          <div key={file.url} className="flex items-center mb-2">
            <span className="flex-grow">{file.pathname}</span>
            <Button onClick={() => handleRename(file)} className="mr-2">✏️</Button>
            <Button onClick={() => handleDelete(file.url)} variant="destructive">🗑️</Button>
          </div>
        ))}
      </div>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="New file name"
          />
          <DialogFooter>
            <Button onClick={() => setIsRenaming(false)}>Cancel</Button>
            <Button onClick={submitRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}