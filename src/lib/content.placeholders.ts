// Central content placeholders. Real copy/data lands here in the content pass.
// Every stub is marked TODO(content) so design gates never block on words.

export interface NavItem {
  label: string;
  id: string;
}

export const NAV: NavItem[] = [
  { label: 'Dossier', id: 'dossier' },
  { label: 'Checkpoints', id: 'checkpoints' },
  { label: 'Ablations', id: 'ablations' },
  { label: 'Weights', id: 'weights' },
  { label: 'Notes', id: 'notes' },
  { label: 'Deploy', id: 'deploy' },
];

export const TICKER_LINES: string[] = [
  'ep 07 — loss 1.204 — grad norm stable',
  'checkpoint saved — weights/generalist',
  'ablation: no-attention — performance drops',
  'lr schedule: cosine — warmup done',
  'eval split: held-out humans — pending',
  // TODO(content): replace with real run-flavored status lines
];

export interface DossierFact {
  key: string;
  value: string;
  redacted?: boolean;
}

export const DOSSIER_FACTS: DossierFact[] = [
  { key: 'name', value: 'Santhosh Sachin' },
  { key: 'degree', value: 'B.Tech, Computer Science and Engineering' },
  { key: 'school', value: 'Amrita Vishwa Vidyapeetham' },
  { key: 'cgpa', value: '8.41 / 10' },
  { key: 'role', value: 'AI-ML Lead, GDSC Amrita Chapter' },
  { key: 'focus', value: 'AI systems, backend engineering, LLMs' },
  { key: 'clearance', value: 'open to work', redacted: true },
  // TODO(content): confirm degree lines + role wording
];

export interface Checkpoint {
  epoch: string;
  title: string;
  blurb: string;
  tags: string[];
  demo: string | null;
  repo: string | null;
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    epoch: 'ep 02',
    title: 'One-View',
    blurb: 'RAG over enterprise docs on Azure OpenAI. Retrieve, cite, answer.',
    tags: ['Azure OpenAI', 'RAG', 'Python', 'FastAPI'],
    demo: null, // TODO(content): real demo URL
    repo: null, // TODO(content): real repo URL
  },
  {
    epoch: 'ep 05',
    title: 'Zephyr AI',
    blurb: 'Conversational agent on open-source LLMs. Small, fast, local-first.',
    tags: ['LLMs', 'Rust', 'Neural Networks'],
    demo: null, // TODO(content): real demo URL
    repo: null, // TODO(content): real repo URL
  },
  // TODO(content): add checkpoint 03 when third project ships
];

export interface Ablation {
  period: string;
  org: string;
  role: string;
  kept: string[];
  dropped: string[];
}

export const ABLATIONS: Ablation[] = [
  {
    period: '2023-06 / present',
    org: 'Lam Research',
    role: 'AI Research Intern',
    kept: [
      'graph neural nets for supply-chain optimization',
      'predictive analytics over supplier graph',
      'cross-functional delivery with hardware teams',
    ],
    dropped: ['tabular baselines that plateaued', 'manual spreadsheet triage'],
  },
  {
    period: '2023-01 / 2023-05',
    org: 'Fidelity Investments',
    role: 'Software Engineering Intern',
    kept: [
      'OpenAI-powered assistants for support flows',
      'FastAPI backend services',
      'Spring migration tooling off AWS EKS',
    ],
    dropped: ['legacy endpoints nobody called', 'unindexed queries'],
  },
  // TODO(content): verify dates + wording with resume
];

export interface WeightCluster {
  name: string;
  weights: string[];
}

export const WEIGHT_CLUSTERS: WeightCluster[] = [
  { name: 'languages', weights: ['Python', 'Rust', 'C++', 'Java', 'JavaScript', 'TypeScript'] },
  { name: 'systems', weights: ['React+Vite', 'Node.js', 'Spring Boot', 'Express', 'Next.js', 'FastAPI', 'Tailwind'] },
  { name: 'ml', weights: ['TensorFlow', 'PyTorch', 'DGL', 'OpenCV', 'NumPy', 'Pandas'] },
  { name: 'llms', weights: ['LangChain', 'OpenAI', 'Anthropic', 'HuggingFace', 'LlamaIndex', 'Gemini'] },
  { name: 'infra', weights: ['Kubernetes', 'Docker', 'AWS EKS', 'AWS EC2', 'AWS S3', 'SageMaker', 'Azure ML'] },
  { name: 'data', weights: ['Git', 'Linux', 'MySQL', 'Postgres', 'MongoDB', 'OpenSearch', 'Firebase'] },
  // TODO(content): confirm cluster membership, no levels by design
];

export interface Note {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
}

export const NOTES: Note[] = [
  {
    id: 'rag-azure-openai',
    title: 'Implementing RAG systems with Azure OpenAI',
    date: '2024-03-15',
    readTime: '8 min',
    excerpt: 'Retrieval that survives contact with enterprise PDFs.',
  },
  {
    id: 'gnn-supply-chain',
    title: 'Graph neural nets in supply chain',
    date: '2024-03-10',
    readTime: '6 min',
    excerpt: 'Suppliers are a graph. Treat them like one.',
  },
  // TODO(content): real URLs + dates + excerpts
];

export const LINKS = {
  github: 'https://github.com/SANTHOSH-SACHIN',
  linkedin: 'https://www.linkedin.com/in/santhosh-sachin/',
  email: 'mailto:santhosh.s.sachin@gmail.com',
  resume: '/assets/SanthoshS_Resume.pdf',
};
