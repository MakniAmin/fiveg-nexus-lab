<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Lab data lives in a browser-local store (src/lib/lab/store.ts) validated by zod schemas in src/lib/lab/types.ts; no backend, because the app only shows demo or imported JSON snapshots and must never claim live core connectivity.
