import re

def fix_navbar():
    with open('components/navbar.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Make the glass slightly more visible on light mode so mix-blend works seamlessly
    content = content.replace('opacity: isDark ? 0.85 : 0.03,', 'opacity: isDark ? 0.85 : 0.85,')
    content = content.replace('opacity: isDark ? 0.88 : 0.03,', 'opacity: isDark ? 0.88 : 0.88,')

    # Remove the useWhiteIcons dynamic toggle and replace with constant true
    content = content.replace(
        'const useWhiteIcons = isDark || (isAboutPage && !scrolledPastHero) || isMobileHomepageHero',
        'const useWhiteIcons = true // Forced true. mix-blend-difference handles contrast dynamically against any background'
    )

    def replace_white_icons(m):
        # We append mix-blend-difference to whatever it was going to output for useWhiteIcons = true
        # So it becomes "some-styles mix-blend-difference"
        white_part = m.group(1)
        return f'"{white_part} mix-blend-difference"'

    # Regex to find `useWhiteIcons ? "..." : "..."` and inject mix-blend-difference
    # We only inject it into the "true" branch
    content = re.sub(r'useWhiteIcons \? "([^"]+)" : "(?:[^"]+)"', replace_white_icons, content)

    # Some elements use className={cn(..., useWhiteIcons ? "..." : "...")} 
    # But wait, in the regex above, we replaced the ENTIRE `useWhiteIcons ? "A" : "B"` expression with `"A mix-blend-difference"`!
    # Let's test if it works.

    # Also fix the styling for `menuButtonColor` and `openMenuButtonColor` which use JS logic
    content = content.replace(
        'menuButtonColor={useWhiteIcons ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}',
        'menuButtonColor="rgba(255,255,255,0.6)" style={{ mixBlendMode: "difference" }}'
    )
    content = content.replace(
        'openMenuButtonColor={useWhiteIcons ? "#e8e8e8" : "#222222"}',
        'openMenuButtonColor="#e8e8e8"'
    )
    content = content.replace(
        '<Hamburger',
        '<Hamburger color="#ffffff" '
    )

    # Ensure contrast on the mobile menu itself
    content = content.replace(
        'className="lg:hidden"',
        'className="lg:hidden mix-blend-difference"'
    )

    with open('components/navbar.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

fix_navbar()
