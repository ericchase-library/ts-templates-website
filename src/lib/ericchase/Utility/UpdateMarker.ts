export class UpdateMarker {
  updated = false;
  constructor(readonly $manager: UpdateMarkerManager) {}
  reset() {
    this.$manager.resetMarker(this);
  }
}

export class UpdateMarkerManager {
  $marks = new Set<UpdateMarker>();
  getNewMarker() {
    const marker = new UpdateMarker(this);
    this.$marks.add(marker);
    return marker;
  }
  resetMarker(mark: UpdateMarker) {
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

export class DataSetMarker<T> {
  dataset = new Set<T>();
  constructor(readonly $manager: DataSetMarkerManager<T>) {}
  reset() {
    this.$manager.resetMarker(this);
  }
}

export class DataSetMarkerManager<T> {
  $marks = new Set<DataSetMarker<T>>();
  getNewMarker() {
    const marker = new DataSetMarker<T>(this);
    this.$marks.add(marker);
    return marker;
  }
  resetMarker(mark: DataSetMarker<T>) {
    mark.dataset.clear();
    this.$marks.add(mark);
  }
  updateMarkers(data: T) {
    for (const mark of this.$marks) {
      mark.dataset.add(data);
    }
  }
}
