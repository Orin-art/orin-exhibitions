// A single ticket drawing is clipped into three equal rail viewports.
export function entranceSlice(index) {
 return `<span class="rail-art ticket-art" aria-hidden="true"><svg viewBox="${index*100} 0 100 360" preserveAspectRatio="none" focusable="false">
 <path class="ticket-paper" d="M18 80H188C188 97 212 97 212 80H282V150C262 150 262 174 282 174V250H212C212 233 188 233 188 250H18V174C38 174 38 150 18 150Z"/>
 <path class="ticket-outline" d="M18 80H188C188 97 212 97 212 80H282V150C262 150 262 174 282 174V250H212C212 233 188 233 188 250H18V174C38 174 38 150 18 150Z"/>
 <path class="ticket-perforation" d="M200 101V229"/>
 <path class="ticket-rule" d="M36 118H180M36 213H180"/>
 <text class="ticket-kicker" x="36" y="107">ORIN / EXHIBITIONS</text>
 <text class="ticket-title" x="35" y="158">ADMIT</text>
 <text class="ticket-title" x="35" y="197">ONE.</text>
 <text class="ticket-caption" x="36" y="234">ART FOR EVERYONE.</text>
 <text class="ticket-stub-title" x="242" y="119" text-anchor="middle">FREE</text>
 <text class="ticket-stub-sub" x="242" y="136" text-anchor="middle">ENTRY</text>
 <g class="ticket-bars"><path d="M222 156V199M227 156V199M236 156V199M244 156V199M250 156V199M260 156V199"/><path class="ticket-bars-thin" d="M231 156V199M240 156V199M255 156V199M265 156V199"/></g>
 <text class="ticket-stub-sub" x="242" y="221" text-anchor="middle">NO. 001</text>
 <path class="ticket-rule" d="M36 273H178"/>
 <text class="ticket-caption" x="36" y="294">YOUR NEXT DISCOVERY</text>
 </svg>${index===2?'<span class="rail-booked">BOOKED ✓</span>':''}</span>`;
}
