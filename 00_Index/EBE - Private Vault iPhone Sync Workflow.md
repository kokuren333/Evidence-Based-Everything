---
project: "Evidence Based Everything"
type: "operations-guide"
status: "published"
draft: false
updated: 2026-05-01
public_safe: true
---

# EBE - Private Vault Mobile Sync Workflow

![[assets/ebe-private-vault-iphone-sync-workflow.png]]

この文書は、Evidence Based Everything（EBE）をWindows上のObsidian Vaultとして日々運用しながら、GitHub private repositoryを経由してiPhone/Androidでも閲覧できるようにするための手順である。

現在のiPhone推奨方式は次の通り。

```text
Windows PC
  EBE Vaultで記事作成
  git push
        ↓
GitHub private repository
  Evidence-Based-Everything-Vault-Private
        ↓ 初回のみ
PlomGit
  private repoをtokenでclone
        ↓
Files
  clone済みフォルダをObsidianディレクトリへコピー
        ↓
Obsidian iPhone
  Vaultとして開く
  以後はGit pluginのPull on startupで自動更新
```

この方式では、iPhone側の初回cloneをObsidian Git pluginに任せない。iPhone版Obsidian Git pluginは、既存の`.git` repositoryがVault内にない初回状態だと、cloneコマンドが動かなかったり、`Git is not ready` のまま進まなかったりする場合があるためである。

初回だけPlomGitでcloneし、FilesアプリでObsidianディレクトリへコピーしておくと、その後はObsidian側のGit pluginで `Pull on startup` を有効化するだけで、PC側の更新を起動時に取得できる。

AndroidではPlomGitが使えない場合があるため、Termux + Gitを推奨する。AndroidはiOSより共有ストレージを扱いやすいため、TermuxでObsidian用フォルダに直接cloneし、以後はTermuxでpullする方式が安定しやすい。

## 必要なiPhoneアプリ

iPhone側で必要なアプリは3つ。

```text
Files
PlomGit
Obsidian
```

- `Files`: iOS標準のファイル管理アプリ。PlomGitでcloneしたフォルダをObsidianのディレクトリへコピーするために使う。
- `PlomGit`: GitHub private repositoryをaccess tokenでcloneするために使う。
- `Obsidian`: コピーしたVaultを開き、閲覧するために使う。

ObsidianにはCommunity pluginの `Git` も入れる。ただし、初回cloneには使わず、コピー後の自動pull用として使う。

## Repository構成

ローカルのWindows Vaultでは、private repositoryを本体、public repositoryを公開用ミラーとして扱う。

```text
Windows local vault
  origin -> private repository
  public -> public repository

private repository
  完全なObsidian Vault

public repository
  GitHub Actionsで生成する公開可能ファイルだけのミラー
```

remoteの例:

```powershell
git remote set-url origin https://github.com/kokuren333/Evidence-Based-Everything-Vault-Private.git
git remote add public https://github.com/kokuren333/Evidence-Based-Everything.git
```

日々の作業はprivate repositoryへpushする。

```powershell
git add .
git commit -m "Update vault"
git push
```

## なぜprivate本体 + publicミラーにするか

Gitの`.gitignore`はremoteごとに切り替わらない。つまり、同じbranchをpublicとprivateに使い分けようとすると、privateにだけ置きたい記事・画像・source note・claim note・MOCのタイトル一覧などを誤ってpublicへpushするリスクがある。

そのため、EBEでは次の構成にする。

```text
private repository = 本体
public repository = allowlistで生成された公開用ミラー
```

public repositoryには、Skills、README、AGENTS、public-safeな運用文書、scripts、config、空ディレクトリ用`.gitkeep`などだけを同期する。記事本文、画像、source、claim、evidence packet、記事タイトルを含むMOCは公開しない。

## Private repository用 `.gitignore`

private repositoryでは、耐久的なVault成果物を追跡する。したがって、`10_Published`、`20_EvidencePackets`、`30_Sources`、`40_Claims`、`50_Assets`、`60_MOCs`、`70_Logs`をpublic用のように丸ごとignoreしない。

例:

```gitignore
/skills/
/.obsidian/workspace*.json
/.obsidian/cache
/.trash/

/_working/**/*
!/_working/**/
!/_working/**/.gitkeep

__pycache__/
*.pyc
.DS_Store
Thumbs.db
desktop.ini
```

Windowsでは日本語ファイル名と深いディレクトリでpathが長くなるため、repository内で次も設定する。

```powershell
git config core.longpaths true
```

## Public mirror workflow

public repositoryはprivate repository内のGitHub Actionsから生成する。

重要なのはallowlist方式である。公開してよいものだけを明示的にコピーする。

公開してよい例:

- `.agents/skills/`
- `AGENTS.md`
- `README.md`
- public-safeな `00_Index/` 文書
- `config/`
- `scripts/`
- 大分類ディレクトリの骨組み
- `.gitkeep`

公開しないもの:

- `10_Published/**` の記事本文
- `10_Published/**/_MOC.md` のうち、記事タイトル一覧を含むもの
- `60_MOCs/**` のうち、記事タイトル一覧を含むもの
- `20_EvidencePackets/**`
- `30_Sources/**`
- `40_Claims/**`
- `50_Assets/Infographics/**`
- `70_Logs/**`

公開用workflow例は次に置く。

```text
config/public-mirror/sync-public-mirror.example.yml
```

## Public mirror用token

private repositoryのGitHub Actionsからpublic repositoryへpushするには、public repositoryに書き込めるfine-grained personal access tokenを使う。

推奨設定:

```text
Repository access:
Only select repositories

Selected repository:
Evidence-Based-Everything

Repository permissions:
Contents: Read and write
```

作成したtokenはprivate repository側にsecretとして保存する。

```text
Settings
-> Secrets and variables
-> Actions
-> New repository secret

Name:
PUBLIC_MIRROR_TOKEN
```

workflow側では次の形で読む。

```yaml
${{ secrets.PUBLIC_MIRROR_TOKEN }}
```

## iPhone用tokenの発行

iPhoneでprivate repositoryを読むためのtokenは、public mirror用tokenとは別に作る。

GitHubで:

```text
Settings
-> Developer settings
-> Personal access tokens
-> Fine-grained tokens
-> Generate new token
```

設定:

```text
Repository access:
Only select repositories

Selected repository:
Evidence-Based-Everything-Vault-Private

Repository permissions:
Contents: Read-only
```

iPhoneから編集してpushしたい場合だけ、`Contents: Read and write` にする。閲覧中心ならRead-onlyが安全である。

## 初回セットアップ: PlomGitでclone

Obsidian Git pluginではなく、PlomGitでprivate repositoryをcloneする。

PlomGitで:

```text
clone/import repository
```

repository URL:

```text
https://github.com/kokuren333/Evidence-Based-Everything-Vault-Private.git
```

認証:

```text
Username:
kokuren333

Password/token:
iPhone用private-vault token
```

cloneが完了するまで待つ。画像ファイルも含むVaultなので、初回は時間がかかる場合がある。

## FilesでObsidianディレクトリへコピー

PlomGitでcloneできたら、Filesアプリを使ってObsidianへ渡す。

手順:

1. Filesを開く。
2. PlomGit側のclone済みrepositoryフォルダを探す。
3. repositoryフォルダそのものをコピーする。
4. Obsidianのアプリディレクトリへ移動する。
5. Obsidianディレクトリ内へ貼り付ける。
6. Obsidianを開く。
7. コピーしたフォルダをVaultとして開く。

この手動コピーが重要である。これにより、Obsidian側には最初から`.git`を含む通常のVaultフォルダが存在する状態になる。

## なぜObsidian Gitで初回cloneしないか

Obsidian Git pluginはmobile対応しているが、iOS/Androidではnative Gitを直接使えない。そのため、mobileでは別実装でGit操作を行う。

この制約のため、iPhoneの初回setupでは次の問題が起きることがある。

- `Git is not ready` のまま進まない。
- command paletteのclone commandが反応しない。
- clone先やbase path設定で詰まる。
- `.git` がまだないVaultではplugin設定が安定しない。

そのため、EBEでは次の役割分担にする。

```text
初回clone:
  PlomGit

Obsidianへの配置:
  Filesでコピー

以後の更新:
  Obsidian Git pluginのPull on startup
```

## Obsidian Git pluginの設定

PlomGit由来のrepositoryフォルダをObsidianディレクトリへコピーした後、ObsidianでCommunity pluginの `Git` を入れる。

設定:

```text
Username:
kokuren333

Password/Personal access token:
iPhone用private-vault token

Custom base path:
空欄

Custom Git directory path:
.git
```

そして次をオンにする。

```text
Pull on startup
```

または表示名が異なる場合:

```text
Auto-pull on Obsidian startup
```

これで、PC側でprivate repositoryへpushした変更があれば、iPhoneでObsidianを開いたときに自動でpullされる。

## 日常運用

Windows:

```powershell
git add .
git commit -m "Update vault"
git push
```

iPhone:

```text
Obsidianを開く
Pull on startupで自動pull
読む
```

推奨はread-mostly運用である。

```text
Windows = 編集・記事生成・commit・push
iPhone = 閲覧中心
```

この運用ならconflictが起きにくい。

## iPhoneで編集する場合

iPhoneで編集する場合は、tokenをRead and writeにする必要がある。

運用ルール:

```text
Obsidianを開く
まずpull
編集する
commit and push
Windows側で同じファイルを同時編集しない
```

閲覧中心なら、iPhone tokenはRead-onlyのままにしておく方が安全である。

## AndroidではTermux + Gitを使う

Androidでは、PlomGitが使えない場合や、GUI Git clientがObsidianのVaultフォルダとうまく連携できない場合がある。そのため、EBEではAndroid向けの標準手順としてTermux + Gitを使う。

Android側で必要なアプリ:

```text
Termux
Obsidian
```

Termuxは、Play Store版ではなく、F-DroidまたはGitHub配布版を使うのが望ましい。TermuxはAndroid上でLinuxに近いCLI環境を提供し、`pkg`でGitをインストールできる。

Android用tokenは、iPhone用と同じくprivate repository専用に作る。

閲覧中心:

```text
Selected repository:
Evidence-Based-Everything-Vault-Private

Repository permissions:
Contents: Read-only
```

Androidから編集してpushする場合だけ:

```text
Repository permissions:
Contents: Read and write
```

### Android初回セットアップ

Termuxを開き、Gitを入れる。

```sh
pkg update
pkg install git
termux-setup-storage
```

`termux-setup-storage` を実行すると、Androidの共有ストレージへアクセスするための許可が求められる。許可すると、Termux側に `~/storage/shared` などのリンクが作られる。

Obsidian用のフォルダを作り、private repositoryをcloneする。

```sh
cd ~/storage/shared/Documents
mkdir -p Obsidian
cd Obsidian
git clone https://github.com/kokuren333/Evidence-Based-Everything-Vault-Private.git
```

認証を求められたら:

```text
Username:
kokuren333

Password:
Android用private-vault token
```

clone後、Obsidian Androidを開き、次のフォルダをVaultとして開く。

```text
Documents/Obsidian/Evidence-Based-Everything-Vault-Private
```

Android版Obsidianでは、Vault switcherから `Open folder as vault` を選び、共有ストレージ内のフォルダを指定する。

### Androidの日常更新

Windows側:

```powershell
git add .
git commit -m "Update vault"
git push
```

Android側:

```sh
cd ~/storage/shared/Documents/Obsidian/Evidence-Based-Everything-Vault-Private
git pull
```

その後、Obsidianを開いて読む。

Androidでもread-mostly運用を推奨する。

```text
Windows = 編集・記事生成・commit・push
Android = pullして閲覧
```

Android側で編集する場合は、pullしてから編集し、編集後にcommit/pushする。WindowsとAndroidで同じファイルを同時編集しない。

## Public repository確認

public mirror workflowが動いた後、public repositoryで次を確認する。

1. 記事本文がない。
2. `50_Assets/Infographics` に生成PNGがない。
3. `20_EvidencePackets`、`30_Sources`、`40_Claims` にprivate成果物がない。
4. 記事タイトル一覧を含むMOCがない。
5. public-safeな運用文書とworkflow例だけが公開されている。

一度public repositoryへprivateなタイトルや内容をpushした場合、後続commitで削除してもGit履歴には残る。履歴からも消したい場合は、public repositoryの履歴を作り直す必要がある。

## Sources

- GitHub Docs: creating and managing fine-grained personal access tokens: https://docs.github.com/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- GitHub Docs: using repository secrets in GitHub Actions: https://docs.github.com/actions/reference/encrypted-secrets
- GitHub Docs: workflow syntax, including `push` branch filters and `workflow_dispatch`: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- GitHub Actions checkout action documentation: https://github.com/actions/checkout
- Obsidian Help: Obsidian for iOS and iPadOS: https://help.obsidian.md/ios
- Obsidian Help: settings and Community plugins: https://obsidian.md/help/settings
- Obsidian Git documentation: https://publish.obsidian.md/git-doc/
- Obsidian Git plugin repository, including mobile notes and auto-pull support: https://github.com/Vinzent03/obsidian-git
- PlomGit official site: https://www.plom.dev/plomgit/
- Obsidian Help: Obsidian for Android: https://obsidian.md/help/android
- Obsidian Help: sync notes across devices, including opening a folder as a vault: https://help.obsidian.md/Getting%20started/Sync%20your%20notes%20across%20devices
- Termux package management wiki: https://github.com/termux/termux-packages/wiki/package-management
