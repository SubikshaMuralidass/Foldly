- [ ] Replace `src/client/scenes/FoldGame.ts` with a from-scratch, PNG-only image-based FoldGame

- [ ] Ensure it uses only: Phaser Scene + GameSession + ModelManager + PaperManager + OrigamiModel
- [ ] Background + overlay + UI text (model/paper/step/instruction) from `boat.json`
- [ ] Centered responsive step PNG (`boat-step-X`) with resize/layoutUI()
- [ ] Drag interaction; on release play short tween and switch to next step PNG
- [ ] After fold: updateStepUI() (step number, instruction, fold hint) from model steps
- [ ] On last step: show "Boat Completed!", then ~1s later `scene.start('Result')`
- [ ] No references to: PaperEngine, PaperMesh, FoldRenderer, FoldAnimator, FoldValidator, Geometry, previewFold, polygon/mesh rendering, folding engine logic
- [ ] Output: exactly one complete `FoldGame.ts` file; do not modify other files
