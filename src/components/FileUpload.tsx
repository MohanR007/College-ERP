
import React, { useCallback, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, File, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onUpload: (url: string) => void;
  existingUrl?: string;
}

export const FileUpload = ({ onUpload, existingUrl }: FileUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      
      toast({
        title: "Uploading file...",
        description: "Please wait while we upload your file",
      });

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log("Attempting to upload file to leave-proofs bucket:", fileName);
      
      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('leave-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Change to true to overwrite if file exists with same name
          contentType: file.type
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully:", data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('leave-proofs')
        .getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);
      
      onUpload(publicUrl);
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, toast]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" disabled={isUploading}>
          <label className="cursor-pointer flex items-center">
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Upload Proof"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={uploadFile}
              disabled={isUploading}
            />
          </label>
        </Button>
        
        {existingUrl && (
          <div className="flex items-center">
            <File className="h-4 w-4 mr-2 text-blue-600" />
            <a 
              href={existingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View uploaded file
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
