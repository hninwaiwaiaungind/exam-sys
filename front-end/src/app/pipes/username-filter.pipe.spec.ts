import { UsernameFilterPipe } from './username-filter.pipe';

describe('UsernameFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new UsernameFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
