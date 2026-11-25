import { site } from './config';

export interface DownloadFile {
  /** A direct link to the file in the latest published release. */
  url: string;
  fileName: string;
}

export interface WindowsDownload {
  /** A direct link to the installer, or the releases page when it could not be looked up. */
  url: string;
  fileName: string;
  version: string | null;
}

/** Everything the Download buttons need, from the latest published release. */
export interface LatestDownloads {
  /** "0.1.4", or null when it could not be looked up. */
  version: string | null;
  /** ISO date the release was published, or null. */
  publishedAt: string | null;
  /** The release page (notes), or the releases list. */
  releaseUrl: string;
  windows: WindowsDownload;
  /** Linux files, only when the latest release has them (v0.1.4 and later). */
  appImage: DownloadFile | null;
  deb: DownloadFile | null;
}

/** The release files, by name (electron-builder's artifactName in the app repo). Exported for tests. */
export const ASSET = {
  windows: /^Atomvs-Setup-[\w.-]+\.exe$/,
  appImage: /^Atomvs-[\w.-]+-x86_64\.AppImage$/,
  deb: /^Atomvs-[\w.-]+-amd64\.deb$/,
};

type Release = {
  tag_name?: string;
  html_url?: string;
  published_at?: string;
  assets?: Array<{ name: string; browser_download_url: string }>;
};

/** The downloads in a release object from the GitHub API. Pure, exported for tests. */
export function downloadsFrom(release: Release | null, repo = site.releasesRepo): LatestDownloads {
  const list = `https://github.com/${repo}/releases`;
  const prefix = `https://github.com/${repo}/releases/download/`;
  const pick = (pattern: RegExp): DownloadFile | null => {
    const a = release?.assets?.find((x) => pattern.test(x.name));
    // Only a download from this repo's releases (never the private source repo, never another host).
    return a && a.browser_download_url.startsWith(prefix) ? { url: a.browser_download_url, fileName: a.name } : null;
  };
  const exe = pick(ASSET.windows);
  const version = release?.tag_name?.replace(/^v/, '') ?? null;
  return {
    version: exe ? version : null,
    publishedAt: exe ? release?.published_at ?? null : null,
    releaseUrl: release?.html_url?.startsWith(list) ? release.html_url : list,
    windows: exe
      ? { url: exe.url, fileName: exe.fileName, version }
      : { url: site.downloadWindows, fileName: site.windowsInstallerName, version: null },
    appImage: exe ? pick(ASSET.appImage) : null,
    deb: exe ? pick(ASSET.deb) : null,
  };
}

/**
 * The files of the latest published release in the public releases repo (drafts and pre-releases are not
 * "latest"). Looked up on the server and cached for 10 minutes, so a new release shows up on its own, without a
 * site change. With no published release yet, or if GitHub cannot be reached, Windows links to the releases list
 * and Linux is not offered.
 */
export async function latestDownloads(): Promise<LatestDownloads> {
  try {
    const res = await fetch(`https://api.github.com/repos/${site.releasesRepo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 600 },
    });
    if (!res.ok) return downloadsFrom(null);
    return downloadsFrom((await res.json()) as Release);
  } catch {
    return downloadsFrom(null);
  }
}

/** The Windows installer of the latest release (kept for the pages that only need Windows). */
export async function latestWindowsDownload(): Promise<WindowsDownload> {
  return (await latestDownloads()).windows;
}
