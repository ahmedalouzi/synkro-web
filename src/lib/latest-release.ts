import { site } from './config';

export interface WindowsDownload {
  /** A direct link to the installer, or the releases page when it could not be looked up. */
  url: string;
  fileName: string;
  version: string | null;
}

const INSTALLER = /^Atomvs-Setup-[\w.-]+\.exe$/;

/**
 * The Windows installer of the latest published release in the public releases repo (drafts and pre-releases
 * are not "latest"). Looked up on the server and cached for 10 minutes, so a new release shows up on its own,
 * without a site change. With no published release yet, or if GitHub cannot be reached, the link goes to the
 * releases list instead.
 */
export async function latestWindowsDownload(): Promise<WindowsDownload> {
  const fallback: WindowsDownload = {
    url: site.downloadWindows,
    fileName: site.windowsInstallerName,
    version: null,
  };
  try {
    const res = await fetch(`https://api.github.com/repos/${site.releasesRepo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 600 },
    });
    if (!res.ok) return fallback;
    const release = (await res.json()) as { tag_name?: string; assets?: Array<{ name: string; browser_download_url: string }> };
    const exe = release.assets?.find((a) => INSTALLER.test(a.name));
    // Only a download from this repo's releases.
    if (!exe || !exe.browser_download_url.startsWith(`https://github.com/${site.releasesRepo}/releases/download/`)) return fallback;
    return { url: exe.browser_download_url, fileName: exe.name, version: release.tag_name?.replace(/^v/, '') ?? null };
  } catch {
    return fallback;
  }
}
