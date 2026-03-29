import { ExperienceModule } from '@/types/school';
import { getCredibilityText, getModuleTypeText, getSentimentText } from '@/lib/school-helpers';
import ModuleCommentAnalysisSection from '@/components/ModuleCommentAnalysisSection';

interface ExperienceModuleCardProps {
  schoolId: string;
  module: ExperienceModule;
}

const sentimentClassNameMap: Record<ExperienceModule['sentiment'], string> = {
  positive: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  mixed: 'bg-amber-50 text-amber-700 border border-amber-100',
  negative: 'bg-rose-50 text-rose-700 border border-rose-100',
};

const ExperienceModuleCard: React.FC<ExperienceModuleCardProps> = ({ schoolId, module }) => {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            情绪倾向：{getSentimentText(module.sentiment)} · 可信度：{getCredibilityText(module.credibility)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            模块分类：{getModuleTypeText(module.moduleType)} · <code>{module.taxonomyKey}</code>
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${sentimentClassNameMap[module.sentiment]}`}
        >
          {getSentimentText(module.sentiment)}
        </span>
      </div>

      <p className="text-sm leading-7 text-gray-600 mb-5">{module.summary}</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {module.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {module.structuredFacts.map((fact) => (
          <div
            key={fact.key}
            className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <p className="text-xs text-gray-500 mb-1">{fact.label}</p>
            <p className="text-sm font-medium text-gray-900">{fact.displayValue}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">学生评论证据</h3>
        <div className="space-y-3">
          {module.evidences.map((evidence) => (
            <article
              key={evidence.id}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
            >
              <p className="text-sm leading-7 text-gray-700 mb-3">“{evidence.quote}”</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>{evidence.authorLabel}</span>
                <span>{evidence.sourceLabel}</span>
                <span>情绪：{getSentimentText(evidence.sentiment)}</span>
                {evidence.context ? <span>{evidence.context}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      <ModuleCommentAnalysisSection schoolId={schoolId} module={module} />
    </section>
  );
};

export default ExperienceModuleCard;
