FROM jupyter/scipy-notebook
LABEL maintainer="Muhammad Aditya Hilmy <mhilmy@hey.com>"

USER $NB_UID

RUN conda install -y -c conda-forge python-gfal2 \
    && conda clean --all -f -y

USER root

RUN apt update -y \
    && apt install -y voms-clients-java \
    && apt clean -y \
    && rm /opt/conda/bin/voms-proxy-init \
    && ln -s /usr/bin/voms-proxy-init /opt/conda/bin/voms-proxy-init

COPY . /rucio-jupyterlab
WORKDIR /rucio-jupyterlab

RUN fix-permissions /rucio-jupyterlab \
    && sed -i -e 's/\r$/\n/' /rucio-jupyterlab/docker/configure.sh

USER $NB_UID

RUN pip install -e . \
    && jupyter serverextension enable --py rucio_jupyterlab --sys-prefix \
    && jupyter labextension link . --dev-build=False \
    && jupyter lab clean -y \
    && npm cache clean --force \
    && rm -rf "/home/${NB_USER}/.cache/yarn" \
    && rm -rf "/home/${NB_USER}/.node-gyp"

ENV JUPYTER_ENABLE_LAB=yes

WORKDIR $HOME
CMD ["/rucio-jupyterlab/docker/configure.sh", "start-notebook.sh"]