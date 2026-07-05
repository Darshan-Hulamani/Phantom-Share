export const sampleShares = [
  {
    id: "aurora-build",
    title: "Aurora release notes",
    type: "document",
    status: "active",
    views: 184,
    downloads: 42,
    size: "2.4 MB",
    expiresAt: Date.now() + 1000 * 60 * 60 * 22,
    protected: true,
    burnAfterView: false
  },
  {
    id: "auth-snippet",
    title: "Auth middleware snippet",
    type: "code",
    status: "active",
    views: 91,
    downloads: 8,
    size: "14 KB",
    expiresAt: Date.now() + 1000 * 60 * 49,
    protected: false,
    burnAfterView: true
  },
  {
    id: "brand-assets",
    title: "Brand asset pack",
    type: "zip",
    status: "active",
    views: 328,
    downloads: 117,
    size: "86 MB",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 5,
    protected: false,
    burnAfterView: false
  },
  {
    id: "launch-video",
    title: "Launch teaser",
    type: "video",
    status: "expired",
    views: 612,
    downloads: 204,
    size: "128 MB",
    expiresAt: Date.now() - 1000 * 60 * 20,
    protected: false,
    burnAfterView: false
  }
];

export const contentExamples = {
  text: "Quick context for tomorrow: the launch packet is ready, design QA is clean, and the final review link expires automatically after the team signs off.",
  code: `const createShare = async ({ payload, expiresIn, password }) => {
  const encrypted = await vault.seal(payload, password);

  return {
    id: crypto.randomUUID(),
    url: phantom.link(encrypted),
    expiresAt: Date.now() + expiresIn
  };
};`
};
