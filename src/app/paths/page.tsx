import { careerPaths } from "@/data/paths";
import { PathCard } from "@/components/PathCard";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Career paths",
};

export default function PathsPage() {
  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          Skill paths
        </Badge>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
          Paths that lead somewhere
        </h1>
        <p className="text-muted-steel max-w-2xl mb-10">
          Each path is a time-boxed sequence of modules with clear outcomes. Enroll, complete
          modules, and track progress on your dashboard.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerPaths.map((path, i) => (
            <PathCard key={path.id} path={path} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
