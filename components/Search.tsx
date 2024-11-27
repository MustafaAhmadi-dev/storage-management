"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Models } from "node-appwrite";
import { useDebounce } from "use-debounce";
import { getFiles } from "@/lib/actions/file.actions";
import { Input } from "./ui/input";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    async function fetchFiles() {
      if (debouncedQuery.length === 0) {
        setOpen(false);
        setResults([]);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const files = await getFiles({ types: [], searchText: debouncedQuery });
      setResults(files.documents);
      setOpen(true);
    }

    fetchFiles();
  }, [path, debouncedQuery, router, searchParams]);

  useEffect(() => {
    if (!searchQuery) setQuery("");
  }, [searchQuery]);

  function handleItem(file: Models.Document) {
    setOpen(false);
    setResults([]);
    router.push(
      `${
        file.type === "video" || file.type === "audio"
          ? "media"
          : file.type + "s"
      }?query=${query}`
    );
  }

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ..."
          className="search-input"
        />

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  key={file.$id}
                  onClick={() => handleItem(file)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 cursor-pointer">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No Files Found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
