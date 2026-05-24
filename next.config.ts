import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isProjectPagesBuild =
  process.env.GITHUB_ACTIONS === "true" && repositoryName === "Zsqsounddesign-Work";
const githubPagesBasePath = isProjectPagesBuild ? "/Zsqsounddesign-Work" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: githubPagesBasePath || undefined,
  assetPrefix: githubPagesBasePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

