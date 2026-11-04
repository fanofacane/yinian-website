import source from "./reference/content-data.json";
import heroImages from "./hero-images.json";
import brand from "./brand-content.json";
export const navigation = [
  ["首页", "home"],
  ["服务产品", "benefits"],
  ["服务体系", "process"],
  ["客户评价", "reviews"],
  ["常见问题", "faqs"],
];
export const benefits = brand.benefits;
export const testimonials = brand.testimonials.map((review, i) => ({
  ...review,
  image: source.testimonials[i].image,
  quoteParts: [{ text: review.quote }],
}));
export const faqs = brand.faqs;
export const processSteps = brand.processSteps.map((step, i) => ({
  ...step,
  icon: source.processIcons[i + 1],
}));
export const projects = heroImages;
export const avatars = source.heroImages.slice(1).map((image) => image.src);
export const logo = source.logo;
export const portrait = source.heroImages[0].src;
export const clientLogos = source.logos;
export const clientNames = brand.clientNames;
