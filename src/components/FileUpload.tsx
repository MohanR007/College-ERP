
import React, { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
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

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('leave-proofs')
        .upload(filePath, file);

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
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    }
  }, [onUpload, toast]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline">
          <label className="cursor-pointer">
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
          <a 
            href={existingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            View uploaded file
          </a>
        )}
      </div>
    </div>
  );
};
