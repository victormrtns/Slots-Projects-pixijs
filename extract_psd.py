"""Extract key UI layers from MAIN GAME.psd as transparent PNGs."""
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from psd_tools import PSDImage

OUT = 'public/assets/ui'
os.makedirs(OUT, exist_ok=True)

psd = PSDImage.open('BANK ROBERRY SLOT/PSD/MAIN GAME/MAIN GAME.psd')
print(f'PSD size: {psd.size}')

def find_layer(name, root=psd):
    for l in root:
        if (l.name or '').strip() == name:
            return l
        if l.is_group():
            r = find_layer(name, l)
            if r is not None: return r
    return None

def find_all(name, root=psd):
    out = []
    for l in root:
        if (l.name or '').strip() == name:
            out.append(l)
        if l.is_group():
            out.extend(find_all(name, l))
    return out

def save_layer(layer, filename, viewport=None):
    """Composite a layer or group and save as PNG."""
    img = layer.composite(viewport=viewport)
    if img is None:
        print(f'  SKIP {filename} (empty)')
        return
    path = os.path.join(OUT, filename)
    img.save(path)
    print(f'  -> {path}  size={img.size}')

# 1. Full BG (warm vault background)
bg = find_layer('BG')
if bg:
    print('Saving BG...')
    save_layer(bg, 'bg.png', viewport=(0, 0, 1920, 1080))

# 2. MENU group (slot machine metal frame) — composite the OUTER MENU group only,
#    not the symbols inside.  The PSD has a top-level MENU group.
menu = None
for l in psd:
    if (l.name or '').strip() == 'MENU' and l.is_group():
        menu = l; break
if menu:
    print('Saving MENU (machine frame)...')
    save_layer(menu, 'machine_frame.png', viewport=(0, 0, 1920, 1080))

# 3. GAME LOGO
logo = find_layer('GAME LOGO')
if logo:
    print('Saving GAME LOGO...')
    save_layer(logo, 'game_logo.png', viewport=(0, 0, 1920, 1080))

# 4. Panels — composite the BG subgroup + FRAME layer for each, no text
def save_panel(group_name, out_name):
    grp = find_layer(group_name)
    if not grp: print(f'  no {group_name}'); return
    # We'll composite the whole group MINUS the TEXT subgroup
    # Hide TEXT subgroup, composite, then restore
    text_grps = []
    for child in grp:
        if child.is_group() and 'TEXT' in (child.name or '').upper():
            text_grps.append(child)
    for t in text_grps: t.visible = False
    save_layer(grp, out_name, viewport=(0, 0, 1920, 1080))
    for t in text_grps: t.visible = True

print('Saving panels (no text)...')
save_panel('BALANCE', 'panel_balance.png')
save_panel('WIN',     'panel_win.png')
save_panel('BET',     'panel_bet.png')

# 5. Buttons — MAIN BUTTONS contains green button (x2) + STEEL + BUTTON RED
mb = find_layer('MAIN BUTTONS')
if mb:
    print('Saving full button strip + individual buttons...')
    save_layer(mb, 'buttons_full.png', viewport=(0, 0, 1920, 1080))

    # Each green button group separately
    greens = [c for c in mb if c.is_group() and (c.name or '').strip().startswith('green button')]
    for i, g in enumerate(greens):
        save_layer(g, f'btn_green_{i}.png', viewport=(0, 0, 1920, 1080))

    # SPIN button: STEEL group + BUTTON RED group composited together.
    # We hide everything in MAIN BUTTONS except those two groups, render, restore.
    keep = {'STEEL', 'BUTTON RED'}
    saved_vis = []
    for c in mb:
        saved_vis.append((c, c.visible))
        if c.is_group():
            if (c.name or '').strip() in keep:
                c.visible = True
            else:
                c.visible = False
        else:
            c.visible = False
    save_layer(mb, 'btn_spin.png', viewport=(0, 0, 1920, 1080))
    for c, v in saved_vis: c.visible = v

# 6. Fox idle/win frames already exist under public/assets/character/

print('DONE')
