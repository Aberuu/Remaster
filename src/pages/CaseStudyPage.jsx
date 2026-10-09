import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';

export default function CaseStudyPage() {
  const { id } = useParams();
  const { projects } = useProjects();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const currentIndex = projects.findIndex((p) => p.id === id || p.slug === id);
  const project = projects[currentIndex];

  if (!project) {
    return (
      <main className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center font-sans bg-[#fbfbfa]">
        <h1 className="text-3xl font-bold text-[#0A0A0A] mb-4">404: Case Study Not Found</h1>
        <Link 
          to="/" 
          style={{ color: '#ffffff' }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] !text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e0492a] transition-colors"
        >
          <span style={{ color: '#ffffff' }}>&larr; Return to Overview</span>
        </Link>
      </main>
    );
  }

  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  return (
    <div className="w-full bg-[#fbfbfa] text-[#0A0A0A] min-h-screen">
      <article className="w-full px-6 sm:px-10 md:px-16 lg:px-24 pt-12 pb-32 max-w-[1440px] mx-auto font-sans">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between border-b border-[rgba(10,10,10,0.12)] pb-4 mb-12 sm:mb-16">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[rgba(10,10,10,0.15)] hover:border-[#0A0A0A] rounded-lg font-mono text-xs font-bold text-[#0A0A0A] uppercase tracking-wider transition-all shadow-sm"
          >
            <span>&larr;</span>
            <span>BACK TO ARCHIVE</span>
          </Link>

          <span className="font-mono text-xs text-[#525a6c] uppercase tracking-wider font-semibold">
            PROJ // {project.year}
          </span>
        </div>

        {/* Case Study Header Card */}
        <header className="bg-white border border-[rgba(10,10,10,0.14)] rounded-2xl p-8 sm:p-12 lg:p-14 shadow-[0_4px_24px_rgba(0,0,0,0.03)] mb-12 sm:mb-16">
          <div className="flex items-center gap-3 font-mono text-xs text-[#e0492a] font-bold uppercase tracking-wider mb-4">
            <span>{project.category}</span>
            <span className="text-[#8b8b8b]">&bull;</span>
            <span className="text-[#3b4252]">{project.role}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#0A0A0A] leading-[1.05] uppercase mb-6">
            {project.title}
          </h1>

          <p className="text-lg sm:text-2xl text-[#242835] font-normal leading-relaxed max-w-4xl mb-8">
            {project.subtitle || project.description}
          </p>

          {/* Project Tags */}
          <div className="flex flex-wrap gap-2 pt-6 border-t border-[rgba(10,10,10,0.1)]">
            {project.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3.5 py-1.5 bg-[#f4f5f8] border border-[rgba(10,10,10,0.1)] rounded-md font-mono text-xs font-semibold text-[#1a1f2c]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Hero Showcase Viewport */}
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-[#101217] rounded-2xl border border-[rgba(10,10,10,0.14)] mb-16 sm:mb-24 overflow-hidden shadow-md">
          {project.video ? (
            <video
              src={project.video}
              poster={project.thumbnail || project.heroImage}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={project.heroImage || project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Structured Narrative Panels */}
        <div className="max-w-5xl mx-auto flex flex-col gap-10 sm:gap-14 mb-24 sm:mb-36">
          
          {project.challenge && (
            <section className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-2xl p-8 sm:p-12 shadow-sm hover:border-[#0A0A0A] transition-all">
              <div className="flex items-center gap-2 font-mono text-xs text-[#e0492a] font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-[#e0492a]" />
                <span>01 // THE CHALLENGE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] uppercase tracking-tight mb-4">
                Context and Problem Formulation
              </h2>
              <p className="text-base sm:text-xl text-[#242938] leading-relaxed font-normal">
                {project.challenge}
              </p>
            </section>
          )}

          {project.solution && (
            <section className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-2xl p-8 sm:p-12 shadow-sm hover:border-[#0A0A0A] transition-all">
              <div className="flex items-center gap-2 font-mono text-xs text-[#e0492a] font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-[#e0492a]" />
                <span>02 // THE ARCHITECTURAL SOLUTION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] uppercase tracking-tight mb-4">
                Engineered Approach and Craft
              </h2>
              <p className="text-base sm:text-xl text-[#242938] leading-relaxed font-normal">
                {project.solution}
              </p>
            </section>
          )}

          {project.process && (
            <section className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-2xl p-8 sm:p-12 shadow-sm hover:border-[#0A0A0A] transition-all">
              <div className="flex items-center gap-2 font-mono text-xs text-[#e0492a] font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-[#e0492a]" />
                <span>03 // EXECUTION AND ITERATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] uppercase tracking-tight mb-4">
                Implementation Workflow
              </h2>
              <p className="text-base sm:text-xl text-[#242938] leading-relaxed font-normal">
                {project.process}
              </p>
            </section>
          )}

          {project.results && (
            <section className="bg-white border-2 border-[rgba(10,10,10,0.12)] rounded-2xl p-8 sm:p-12 shadow-sm hover:border-[#0A0A0A] transition-all">
              <div className="flex items-center gap-2 font-mono text-xs text-[#e0492a] font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-[#e0492a]" />
                <span>04 // OUTCOME AND VERIFICATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] uppercase tracking-tight mb-4">
                Impact and Performance Metrics
              </h2>
              <p className="text-base sm:text-xl text-[#242938] leading-relaxed font-normal">
                {project.results}
              </p>
            </section>
          )}

        </div>

        {/* Project Navigation Footer Cards */}
        <nav aria-label="Pagination" className="border-t-2 border-[#0A0A0A] pt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Link
            to={`/project/${prevProject.id}`}
            className="group bg-white border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <span className="font-mono text-xs text-[#525a6c] font-semibold uppercase tracking-wider mb-3">
              &larr; PREVIOUS COMMISSION
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#0A0A0A] group-hover:text-[#e0492a] transition-colors uppercase">
              {prevProject.title}
            </span>
          </Link>

          <Link
            to={`/project/${nextProject.id}`}
            className="group bg-white border border-[rgba(10,10,10,0.14)] hover:border-[#0A0A0A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between md:items-end md:text-right"
          >
            <span className="font-mono text-xs text-[#525a6c] font-semibold uppercase tracking-wider mb-3">
              NEXT COMMISSION &rarr;
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#0A0A0A] group-hover:text-[#e0492a] transition-colors uppercase">
              {nextProject.title}
            </span>
          </Link>
        </nav>

      </article>
    </div>
  );
}
