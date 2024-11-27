import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

type ThumbnailProps = {
  type: string;
  extension: string;
  url: string;
  className?: string;
  imageClassName?: string;
};
function Thumbnail({
  type,
  extension,
  url,
  className,
  imageClassName,
}: ThumbnailProps) {
  const isImage = type === "image" && extension !== "svg";
  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
}

export default Thumbnail;
