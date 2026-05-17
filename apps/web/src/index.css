@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Sophisticated Teal & Slate Palette */
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;
    
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    
    --primary: 180 100% 25%; /* Deep Teal */
    --primary-foreground: 210 40% 98%;
    
    --secondary: 214 32% 91%;
    --secondary-foreground: 222 47% 11%;
    
    --muted: 214 32% 91%;
    --muted-foreground: 215 16% 47%;
    
    --accent: 180 40% 90%;
    --accent-foreground: 180 100% 25%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;

    /* Semantic Colors for Maintenance */
    --success: 142 71% 45%;
    --success-foreground: 144 100% 11%;
    
    --warning: 38 92% 50%;
    --warning-foreground: 48 96% 11%;
    
    --danger: 0 84% 60%;
    --danger-foreground: 210 40% 98%;

    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 180 100% 25%;
    
    --radius: 1rem;

    /* Utility Category Colors - Light Mode */
    --electric: 45 93% 47%;
    --water: 217 91% 60%;
    --gas: 24 95% 53%;
    --internet: 271 91% 65%;
    --phone: 330 81% 60%;
    --trash: 142 71% 45%;
    --pest-control: 28 43% 35%;
    --security: 215 16% 47%;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    
    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 180 70% 40%; /* Bright Teal */
    --primary-foreground: 222 47% 11%;
    
    --secondary: 217 32% 17%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217 32% 17%;
    --muted-foreground: 215 20% 65%;
    
    --accent: 217 32% 17%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62% 30%;
    --destructive-foreground: 210 40% 98%;

    /* Semantic Colors for Maintenance */
    --success: 142 60% 45%;
    --success-foreground: 144 100% 95%;
    
    --warning: 38 92% 50%;
    --warning-foreground: 48 96% 95%;
    
    --danger: 0 72% 51%;
    --danger-foreground: 210 40% 98%;
    
    --border: 217 32% 17%;
    --input: 217 32% 17%;
    --ring: 180 70% 40%;

    /* Utility Category Colors - Dark Mode */
    --electric: 45 93% 37%;
    --water: 217 91% 50%;
    --gas: 24 95% 43%;
    --internet: 271 91% 55%;
    --phone: 330 81% 50%;
    --trash: 142 71% 35%;
    --pest-control: 28 43% 25%;
    --security: 215 16% 37%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Outfit', sans-serif;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  
  h1, h2, h3, h4, h5, h6 {
    text-wrap: balance;
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  .transition-interactive {
    @apply transition-all duration-300 ease-out;
  }
  
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }

  .glass-panel {
    @apply bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800/50;
  }

  /* Smooth Blending Utilities for Header & Logo */
  .anti-alias-smooth {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .smooth-logo-blend {
    background: linear-gradient(90deg, rgba(30, 58, 138, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
    mask-image: linear-gradient(to right, black 75%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 75%, transparent 100%);
  }

  /* Utility Category Gradients */
  .category-tile-electric { background: linear-gradient(135deg, hsl(var(--electric)), #d97706); color: white; }
  .category-tile-water { background: linear-gradient(135deg, hsl(var(--water)), #2563eb); color: white; }
  .category-tile-gas { background: linear-gradient(135deg, hsl(var(--gas)), #c2410c); color: white; }
  .category-tile-internet { background: linear-gradient(135deg, hsl(var(--internet)), #7e22ce); color: white; }
  .category-tile-phone { background: linear-gradient(135deg, hsl(var(--phone)), #be185d); color: white; }
  .category-tile-trash { background: linear-gradient(135deg, hsl(var(--trash)), #15803d); color: white; }
  .category-tile-pest { background: linear-gradient(135deg, hsl(var(--pest-control)), #451a03); color: white; }
  .category-tile-security { background: linear-gradient(135deg, hsl(var(--security)), #334155); color: white; }
  .category-tile-other { background: linear-gradient(135deg, #64748b, #1e293b); color: white; }

  /* Interactive Card Effects */
  .hover-card-effect {
    @apply transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:brightness-110 cursor-pointer active:scale-[0.98];
  }
}