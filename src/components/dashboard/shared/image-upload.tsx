'use client';
import { FC, useEffect, useState } from "react";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
  type: 'standard' | 'profile' | 'cover'
  dontShowPreview?: boolean;
}

const ImageUpload: FC<ImageUploadProps> = ({ disabled, onChange, onRemove, value, type, dontShowPreview }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return null;
  }
  return <div></div>;
};

export default ImageUpload;