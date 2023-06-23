FROM opensearchproject/opensearch-dashboards:2.8.0

COPY ./build /tmp

USER root
RUN mv /tmp/observabilityDashboards*.zip /tmp/observabilityDashboards.zip
USER opensearch-dashboards

RUN /usr/share/opensearch-dashboards/bin/opensearch-dashboards-plugin remove observabilityDashboards && \
      /usr/share/opensearch-dashboards/bin/opensearch-dashboards-plugin install file:///tmp/observabilityDashboards.zip

USER root
RUN rm -r /tmp/observabilityDashboards.zip
USER opensearch-dashboards
