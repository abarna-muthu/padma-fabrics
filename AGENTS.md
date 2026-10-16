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

- Keep the storefront at the index route and shared sample catalog logic in a browser-safe module, so browsing and enquiries work without a commerce service.
- Use session-only React state for the preview bag and saved selections; no persistent orders or payments exist until a commerce service is connected.
- Use original uploaded brand assets through CDN pointers and bundled generated fabric imagery for the explicitly labelled sample collection, so real brand identity stays distinct from illustrative stock.
- Define storefront styles and visual roles in the global design system, with reusable Button variants for controls.
