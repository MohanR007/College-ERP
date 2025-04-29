
import React, { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onUpload: (url: string) => void;
  existingUrl?: string;
}

export const FileUpload = ({ onUpload, existingUrl }: FileUploadProps) => {
  const { toast } = useToast();

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

      toast({
        title: "Uploading file...",
        description: "Please wait while we upload your file",
      });

      // Create the storage bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('leave-proofs');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Create the bucket
        const { error: createError } = await supabase
          .storage
          .createBucket('leave-proofs', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
          });
        
        if (createError) throw createError;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('leave-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('leave-proofs')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again later.",
        variant: "destructive",
      });
    }
  }, [onUpload, toast]);

  const getFileTypeFromUrl = (url?: string) => {
    if (!url) return null;
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return 'image';
    }
    return 'document';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline">
          <label className="cursor-pointer flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Upload Proof
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={uploadFile}
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
