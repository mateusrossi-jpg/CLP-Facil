import { filterTrainingProjects, trainingProjects, type ProjectCatalogQuery, type TrainingProject } from './projectCatalog';
import { getIoPointsForProject } from './projectIoMaps';

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function projectIoMatchesSearch(project: TrainingProject, search: string): boolean {
  const query = normalizeText(search);
  if (!query) return true;

  return getIoPointsForProject(project.id).some((point) => {
    const searchable = [point.tag, point.label, point.description, point.kind, point.normallyClosed ? 'NF normalmente fechado' : '', point.safetyCritical ? 'critico seguranca safety' : '']
      .map((item) => normalizeText(item));
    return searchable.some((item) => item.includes(query));
  });
}

export function searchTrainingProjects(query: ProjectCatalogQuery = {}): TrainingProject[] {
  const baseResults = filterTrainingProjects(query);
  const search = query.search ?? '';

  if (!normalizeText(search)) {
    return baseResults;
  }

  const baseIds = new Set(baseResults.map((project) => project.id));
  const filter = query.filter ?? 'all';
  const ioResults = trainingProjects.filter((project) => {
    const filterMatch =
      filter === 'all' ||
      (filter === 'favorites' ? project.favorite : project.difficulty === filter);
    return filterMatch && projectIoMatchesSearch(project, search);
  });

  for (const project of ioResults) {
    if (!baseIds.has(project.id)) {
      baseResults.push(project);
      baseIds.add(project.id);
    }
  }

  return baseResults;
}
