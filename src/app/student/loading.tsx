export default function StudentLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 animate-pulse">
      {/* Welcome skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-2xl" />
          <div className="h-10 w-64 bg-muted rounded-2xl" />
        </div>
        <div className="h-5 w-80 bg-muted rounded-full" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-[2.5rem] h-40" />
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-40 bg-muted rounded-full" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-[2rem] h-28" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-muted rounded-[2.5rem] h-48" />
          <div className="bg-muted rounded-[2.5rem] h-48" />
        </div>
      </div>
    </div>
  );
}
