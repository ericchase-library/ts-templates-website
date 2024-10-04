export class UpdateMarker<Extra = void> {
  updated = false;
  constructor(readonly $manager: UpdateMarkerManager<Extra>) {}
  reset() {
    this.$manager.resetMarker(this);
  }
}

export class UpdateMarkerManager<Extra = void> {
  $marks = new Set<UpdateMarker<Extra>>();
  extra: Extra;
  constructor(extra?: Extra extends void ? never : Extra) {
    this.extra = extra as Extra;
  }
  getNewMarker() {
    const marker = new UpdateMarker(this);
    this.$marks.add(marker);
    return marker;
  }
  resetMarker(mark: UpdateMarker<Extra>) {
    mark.updated = false;
    this.$marks.add(mark);
  }
  updateMarkers() {
    for (const mark of this.$marks) {
      this.$marks.delete(mark);
      mark.updated = true;
    }
  }
}
