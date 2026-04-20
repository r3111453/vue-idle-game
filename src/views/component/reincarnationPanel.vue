resetPoints() {
  if (confirm('重置后所有已分配的转生点数将返还，确认重置吗？')) {
    let totalSpent = 0;
    this.attr.forEach(item => {
      totalSpent += item.point;
    });
    const newPoint = this.reincarnationPoint + totalSpent;
    this.attr.forEach(item => {
      item.point = 0;
      switch (item.name) {
        case 'HP':
          item.currentValue = item.oldValue;
          break;
        case 'ATK':
          item.currentValue = item.oldValue;
          break;
        case 'CRIT':
          item.currentValue = item.oldValue;
          break;
        case 'CRITDMG':
          item.currentValue = item.oldValue;
          break;
        case 'DEF':
          item.currentValue = item.oldValue;
          break;
        case 'BLOC':
          item.currentValue = item.oldValue;
          break;
        case 'MOVESPEED':
          item.currentValue = item.oldValue;
          break;
        case 'BATTLESPEED':
          item.currentValue = item.oldValue;
          break;
        default:
          break;
      }
    });
    this.reincarnationPoint = newPoint;
    this.$store.commit('set_player_rein', {
      count: this.reinCount,
      point: newPoint
    });
    this.caculateAttr();
    this.$message({ message: '转生点数已重置', type: 'success' });
  }
}
