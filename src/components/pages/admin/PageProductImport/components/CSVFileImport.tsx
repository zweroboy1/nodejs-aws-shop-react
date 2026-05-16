import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [error, setError] = React.useState<string>();
  const [uploading, setUploading] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) return;
    setError(undefined);
    setUploading(true);
    try {
      console.log("uploadFile to", url);

      const response = await axios.get<string>(url, {
        params: { name: file.name },
      });
      console.log("File to upload:", file.name);
      console.log("Uploading to:", response.data);

      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "text/csv" },
      });
      console.log("Result:", result);

      if (!result.ok) {
        throw new Error(`S3 upload failed: ${result.status} ${result.statusText}`);
      }
      setFile(undefined);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" accept=".csv" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile} disabled={uploading}>
            Remove file
          </button>
          <button onClick={uploadFile} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload file"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </Box>
  );
}
