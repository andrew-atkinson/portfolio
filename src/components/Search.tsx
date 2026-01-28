import type { CollectionEntry } from "astro:content";
import { createEffect, createSignal, onMount, For } from "solid-js";
import Fuse from "fuse.js";
import ArrowCard from "@components/ArrowCard";
import SearchBar from "@components/SearchBar";
import { cn } from "@lib/utils";

type Props = {
  tags: string[];
  data:
    | CollectionEntry<"blog">[]
    | CollectionEntry<"projects">[]
    | CollectionEntry<"panoramas">[]
    | CollectionEntry<"series">[];
  images: CollectionEntry<"images">[];
};

export default function Search({ tags, data, images }: Props) {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<CollectionEntry<"blog">[]>([]);
  const [filter, setFilter] = createSignal(new Set<string>());
  const [collection, setCollection] = createSignal<CollectionEntry<"blog">[]>(
    []
  );
  const [descending, setDescending] = createSignal(false);
  const [getTagVisibility, setTagVisibility] = createSignal(false);

  const coerced = data.map((entry) => entry as CollectionEntry<"blog">);

  const fuse = new Fuse(coerced, {
    keys: ["slug", "data.title", "data.summary", "data.tags", "data.project"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4,
  });

  const onSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  createEffect(() => {
    if (query().length < 2) {
      setResults([]);
    } else {
      setResults(fuse.search(query()).map((result) => result.item));
    }
    const filtered = (
      query().length < 2
        ? coerced
        : fuse.search(query()).map((result) => result.item)
    ).filter((entry) =>
      Array.from(filter()).every((value) =>
        entry.data.tags.some(
          (tag: string) => tag.toLowerCase() === String(value).toLowerCase()
        )
      )
    );
    setCollection(descending() ? filtered.toReversed() : filtered);
  });

  function toggleDescending() {
    setDescending(!descending());
  }

  function toggleTag(tag: string) {
    setFilter(
      (prev) =>
        new Set(
          prev.has(tag) ? [...prev].filter((t) => t !== tag) : [...prev, tag]
        )
    );
  }

  function clearFilters() {
    setFilter(new Set<string>());
  }

  function toggleControls() {
    setTagVisibility(!getTagVisibility());
  }

  onMount(() => {
    const wrapper = document.getElementById("search-collection-wrapper");
    if (wrapper) {
      wrapper.style.minHeight = "unset";
    }
  });

  return (
    <div>
      {/* Search Bar */}
      <SearchBar
        onSearchInput={onSearchInput}
        query={query}
        setQuery={setQuery}
        placeholderText="What are you looking for?"
      />
      {/* Toggle Controls Button - Moved outside the hidden container */}
      <div class="flex justify-end mt-5">
        <button
          onClick={toggleControls}
          class="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {getTagVisibility() ? "Show Tags" : "Hide Tags"}
        </button>
      </div>
      <div class="grid grid-cols-1 gap-6">
        {/* Control Panel */}
        <div
          class={cn("col-span-3 sm:col-span-1", getTagVisibility() && "hidden")}
        >
          <div class="sticky top-24 mt-1">
            {/* Tag Filters */}
            <div class="relative flex flex-row justify-between w-full">
              <p class="text-sm font-semibold uppercase my-0 text-black dark:text-white">
                Tags
              </p>
              {filter().size > 0 && (
                <button
                  onClick={clearFilters}
                  class="absolute flex justify-center items-center h-full w-10 right-0 top-0 stroke-neutral-400 dark:stroke-neutral-500 hover:stroke-neutral-600 hover:dark:stroke-neutral-300"
                >
                  <svg class="size-5">
                    <use href={`/ui.svg#x`} />
                  </svg>
                </button>
              )}
            </div>
            <ul class="flex flex-wrap gap-1.5">
              <For each={tags}>
                {(tag) => (
                  <li class="">
                    <button
                      onClick={() => toggleTag(tag)}
                      class={cn(
                        "w-full px-2 py-1 rounded",
                        "flex gap-2 items-center",
                        "bg-black/5 dark:bg-white/10",
                        "hover:bg-black/10 hover:dark:bg-white/15",
                        "transition-colors duration-300 ease-in-out",
                        filter().has(tag) && "text-black dark:text-white"
                      )}
                    >
                      <svg
                        class={cn(
                          "shrink-0 size-5 fill-black/50 dark:fill-white/50",
                          "transition-colors duration-300 ease-in-out",
                          filter().has(tag) && "fill-black dark:fill-white"
                        )}
                      >
                        <use
                          href={`/ui.svg#square`}
                          class={cn(!filter().has(tag) ? "block" : "hidden")}
                        />
                        <use
                          href={`/ui.svg#square-check`}
                          class={cn(filter().has(tag) ? "block" : "hidden")}
                        />
                      </svg>

                      <span class="truncate block min-w-0 pt-[2px]">{tag}</span>
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>

        {/* Posts */}
        <div
          class={cn(
            "col-span-3",
            getTagVisibility() ? "sm:col-span-2" : "sm:col-span-3"
          )}
        >
          <div class="flex flex-col">
            {query().length >= 2 && (
              <div class="mt-12">
                <div class="flex justify-between flex-row mb-2">
                  <div class="text-sm uppercase mb-2">
                    Found {results().length} results for {`'${query()}'`}
                  </div>
                  <button
                    onClick={toggleDescending}
                    class="flex flex-row gap-1 stroke-neutral-400 dark:stroke-neutral-500 hover:stroke-neutral-600 hover:dark:stroke-neutral-300 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 hover:dark:text-neutral-300"
                  >
                    <div class="text-sm uppercase">
                      {descending() ? "DESCENDING" : "ASCENDING"}
                    </div>
                    <svg class="size-5 left-2 top-[0.45rem]">
                      <use
                        href={`/ui.svg#sort-descending`}
                        class={descending() ? "block" : "hidden"}
                      ></use>
                      <use
                        href={`/ui.svg#sort-ascending`}
                        class={descending() ? "hidden" : "block"}
                      ></use>
                    </svg>
                  </button>
                </div>
                <ul class="flex flex-col gap-3">
                  {collection().map((entry) => {
                    let thumbnail = images.filter(
                      (img) => img.slug === entry.data.thumbnail
                    );
                    return (
                      <li>
                        <ArrowCard
                          entry={entry}
                          pill={true}
                          getTagVisibility={getTagVisibility}
                          image={
                            thumbnail.length > 0
                              ? thumbnail[0].data.src.src
                              : null
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
