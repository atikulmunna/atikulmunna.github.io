/**
 * Skills rails initializer
 * Keeps the legacy script entrypoint valid while the section uses static rails.
 */
const SkillsMarquee = {
  init() {
    const section = document.getElementById('skills');
    if (!section) return;
    section.classList.add('skills-rails-ready');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SkillsMarquee.init());
} else {
  SkillsMarquee.init();
}
