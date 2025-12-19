test('reverts attribute change', (done) => {
    document.body.innerHTML = '<button id="btn" disabled></button>';
    const btn = document.getElementById('btn');
    StateGuard.protect('#btn', { attributes: ['disabled'] });
    btn.removeAttribute('disabled');
    setTimeout(() => {
        expect(btn.hasAttribute('disabled')).toBe(true);
        done();
    }, 50);
});