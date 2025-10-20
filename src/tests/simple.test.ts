describe('Simple Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const testString = 'FarmTally';
    expect(testString.toLowerCase()).toBe('farmtally');
    expect(testString.length).toBe(9);
  });

  it('should test array operations', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray.length).toBe(5);
    expect(testArray.includes(3)).toBe(true);
    expect(testArray.filter(n => n > 3)).toEqual([4, 5]);
  });
});