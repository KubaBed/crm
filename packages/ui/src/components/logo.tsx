import type * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={512}
		height={512}
		viewBox="0 0 512 512"
		fill="none"
		aria-label="Workshift"
		{...props}
	>
		<polygon points="141,141 371,141 333,205 103,205" fill="currentColor" fillOpacity={0.18} />
		<polygon points="192,237 422,237 384,301 154,301" fill="#9ce069" />
		<polygon points="141,333 371,333 333,397 103,397" fill="currentColor" fillOpacity={0.18} />
	</svg>
);
export default Logo;
