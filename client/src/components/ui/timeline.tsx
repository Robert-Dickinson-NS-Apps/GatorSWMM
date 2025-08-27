import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  era: string;
  highlights: string[];
  color: string;
  current?: boolean;
}

interface TimelineStatistic {
  value: string;
  label: string;
}

interface TimelineProps {
  items: TimelineItem[];
  statistics: TimelineStatistic[];
}

export function Timeline({ items, statistics }: TimelineProps) {
  return (
    <div>
      <p className="text-lg leading-relaxed mb-8 text-center">
        SWMM has evolved over more than 50 years, with four major upgrades transforming it into today's comprehensive modeling platform.
      </p>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-ufOrange"></div>
        
        {/* Timeline Items */}
        <div className="space-y-8">
          {items.map((item, index) => {
            const colorClass = item.color === "ufOrange" ? "bg-ufOrange" : 
                              item.color === "ufBlue" ? "bg-ufBlue" :
                              item.color === "green" ? "bg-green-500" : "bg-ufOrange";
            
            const cardClass = item.color === "ufOrange" ? "bg-ufLightOrange" :
                             item.color === "ufBlue" ? "bg-blue-50" :
                             item.color === "green" ? "bg-green-50" : "bg-ufLightOrange";

            return (
              <div key={index} className="timeline-item flex items-start space-x-6" data-testid={`timeline-item-${item.year}`}>
                <div className={`flex-shrink-0 w-16 h-16 ${colorClass} rounded-full flex items-center justify-center text-white font-bold`}>
                  {item.year}
                </div>
                <Card className={`flex-1 ${cardClass} rounded-lg p-6 ${item.current ? "border-2 border-ufOrange" : ""}`}>
                  <h3 className="text-lg font-semibold text-ufBlue mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className="bg-white">
                      {item.era}
                    </Badge>
                    {item.highlights.map((highlight, idx) => (
                      <Badge 
                        key={idx} 
                        variant={item.current ? "default" : "secondary"}
                        className={item.current ? "bg-ufOrange text-white" : ""}
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {statistics.map((stat, index) => {
          const bgClass = index === 0 ? "bg-ufLightBlue" :
                         index === 1 ? "bg-ufLightOrange" : "bg-green-50";
          const textClass = index === 0 ? "text-ufBlue" :
                           index === 1 ? "text-ufOrange" : "text-green-600";
          
          return (
            <div key={index} className={`text-center p-4 ${bgClass} rounded-lg`} data-testid={`statistic-${index}`}>
              <div className={`text-2xl font-bold ${textClass}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
